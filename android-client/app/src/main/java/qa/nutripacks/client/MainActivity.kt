package qa.nutripacks.client

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.webkit.CookieManager
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.ProgressBar
import android.widget.LinearLayout
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.google.android.material.bottomnavigation.BottomNavigationView

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private lateinit var bottomNavigation: BottomNavigationView
    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var offlinePanel: LinearLayout

    private val host = "nutripacks-qatar.vercel.app"
    private val baseUrl = "https://$host"
    private val startUrl = baseUrl

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        progressBar = findViewById(R.id.progressBar)
        bottomNavigation = findViewById(R.id.bottomNavigation)
        swipeRefresh = findViewById(R.id.swipeRefresh)
        offlinePanel = findViewById(R.id.offlinePanel)

        configureWebView()
        configureNavigation()
        swipeRefresh.setOnRefreshListener { webView.reload() }
        findViewById<View>(R.id.retryButton).setOnClickListener {
            offlinePanel.visibility = View.GONE
            webView.reload()
        }

        if (savedInstanceState == null) webView.loadUrl(startUrl) else webView.restoreState(savedInstanceState)

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) webView.goBack() else finish()
            }
        })
    }

    override fun onSaveInstanceState(outState: Bundle) {
        webView.saveState(outState)
        super.onSaveInstanceState(outState)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun configureWebView() {
        CookieManager.getInstance().apply {
            setAcceptCookie(true)
            setAcceptThirdPartyCookies(webView, false)
        }

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = false
            allowContentAccess = false
            javaScriptCanOpenWindowsAutomatically = false
            setSupportMultipleWindows(false)
            mediaPlaybackRequiresUserGesture = true
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                progressBar.progress = newProgress
                progressBar.visibility = if (newProgress >= 100) View.GONE else View.VISIBLE
            }
        }

        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: android.graphics.Bitmap?) {
                super.onPageStarted(view, url, favicon)
                offlinePanel.visibility = View.GONE
            }

            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val uri = request.url
                if (uri.scheme == "https" && uri.host == host && isCustomerPath(uri.path.orEmpty())) return false
                if (uri.scheme == "mailto" || uri.scheme == "tel") {
                    startActivity(Intent(Intent.ACTION_VIEW, uri))
                    return true
                }
                if (uri.scheme == "https") startActivity(Intent(Intent.ACTION_VIEW, uri))
                return true
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                swipeRefresh.isRefreshing = false
                offlinePanel.visibility = View.GONE
                syncNavigation(url)
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: android.webkit.WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    swipeRefresh.isRefreshing = false
                    offlinePanel.visibility = View.VISIBLE
                }
            }
        }
    }

    private fun configureNavigation() {
        bottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_home -> loadCustomerUrl("/")
                R.id.nav_menu -> loadCustomerUrl("/menu")
                R.id.nav_meals -> loadCustomerUrl("/account")
                R.id.nav_account -> loadCustomerUrl("/account")
                else -> return@setOnItemSelectedListener false
            }
            true
        }
    }

    private fun loadCustomerUrl(path: String) {
        val target = "$baseUrl$path"
        if (webView.url != target) webView.loadUrl(target)
    }

    private fun syncNavigation(url: String?) {
        val path = runCatching { Uri.parse(url).path.orEmpty() }.getOrDefault("")
        val itemId = when {
            path.startsWith("/menu") -> R.id.nav_menu
            path.startsWith("/select") -> R.id.nav_meals
            path.startsWith("/account") -> R.id.nav_account
            else -> R.id.nav_home
        }
        if (bottomNavigation.selectedItemId != itemId) bottomNavigation.menu.findItem(itemId).isChecked = true
    }

    private fun isCustomerPath(path: String): Boolean {
        val blocked = listOf("/admin", "/staff", "/api/admin", "/api/staff")
        return blocked.none { path == it || path.startsWith("$it/") }
    }
}
