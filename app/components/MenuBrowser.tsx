'use client';

import { useMemo, useState } from 'react';
import type { MenuItem } from '../../lib/catalog';

type FilterKey = 'all' | 'breakfast' | 'main' | 'snack' | 'gym';

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All Meals' },
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'main', label: 'Mains' },
  { key: 'snack', label: 'Snacks' },
  { key: 'gym', label: 'Gym Menu' }
];

export default function MenuBrowser({ meals }: { meals: MenuItem[] }) {
  const [filter, setFilter] = useState<FilterKey>('all');

  const visible = useMemo(() => {
    if (filter === 'all') return meals;
    if (filter === 'gym') return meals.filter(meal => meal.is_gym_menu);
    return meals.filter(meal => meal.category === filter);
  }, [filter, meals]);

  return (
    <>
      <div className="referenceFilterRow" role="tablist" aria-label="Menu filters">
        {filters.map(item => {
          const count = item.key === 'all'
            ? meals.length
            : item.key === 'gym'
              ? meals.filter(meal => meal.is_gym_menu).length
              : meals.filter(meal => meal.category === item.key).length;
          return (
            <button
              key={item.key}
              type="button"
              className={filter === item.key ? 'referenceFilter active' : 'referenceFilter'}
              onClick={() => setFilter(item.key)}
              aria-pressed={filter === item.key}
            >
              {item.label} <span>{count}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="menuEmptyState">
          <strong>No meals in this filter yet.</strong>
          <p>Choose another filter to see the active Nutripacks catalog.</p>
        </div>
      ) : (
        <section className="contentWidth sectionBlock menuPageGrid referenceMenuGrid">
          {visible.map(meal => (
            <article className="mealCard referenceMealCard" key={meal.id}>
              <div className="mealImageWrap">
                <img
                  className="mealImage"
                  src={meal.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85'}
                  alt={meal.name}
                />
                <span className="mealType">{meal.category}</span>
                <span className="menuHeart" aria-hidden="true">♡</span>
              </div>
              <div className="mealBody">
                <div className="mealTitleRow">
                  <h3>{meal.name}</h3>
                  <strong>{meal.calories}<small> kcal</small></strong>
                </div>
                {meal.description && <p className="mealDescription">{meal.description}</p>}
                <div className="macroRow">
                  <span><b>{Number(meal.protein_g)}g</b> protein</span>
                  <span><b>{Number(meal.carbs_g)}g</b> carbs</span>
                  <span><b>{Number(meal.fat_g)}g</b> fat</span>
                </div>
                <div className="tagRow">
                  {Number(meal.protein_g) >= 40 && <span className="softTag">High protein</span>}
                  {Number(meal.calories) < 500 && <span className="softTag">Under 500 kcal</span>}
                  {meal.is_gym_menu && <span className="softTag">Gym menu</span>}
                </div>
                {(meal.allergens || []).length > 0 && <small className="allergenLine">Allergens: {meal.allergens.join(', ')}</small>}
              </div>
            </article>
          ))}
        </section>
      )}
    </>
  );
}
