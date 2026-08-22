// Fixed per-category tag colors — reuses the existing palette only
// (sea/ochre/route-blue), never invents a new hue.
const COLORS = {
  sightseeing: { bg: 'bg-route-blue', text: 'text-route-blue', border: 'border-route-blue' },
  culture: { bg: 'bg-route-blue', text: 'text-route-blue', border: 'border-route-blue' },
  food: { bg: 'bg-ochre', text: 'text-ochre', border: 'border-ochre' },
  nightlife: { bg: 'bg-ochre', text: 'text-ochre', border: 'border-ochre' },
  adventure: { bg: 'bg-sea', text: 'text-sea', border: 'border-sea' },
};

export function categoryColor(category) {
  return COLORS[category] || COLORS.sightseeing;
}
