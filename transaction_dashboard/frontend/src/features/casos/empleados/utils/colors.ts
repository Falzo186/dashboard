// Paleta de colores dinámica para empleados
const colors = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // emerald
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
]

export const getEmployeeColor = (index: number): string => {
  return colors[index % colors.length]
}

export const getEmployeeColorTailwind = (index: number): string => {
  const tailwindColors = [
    'bg-blue-500',
    'bg-red-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-violet-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-orange-500',
  ]
  return tailwindColors[index % tailwindColors.length]
}

export const getEmployeeTextColorTailwind = (index: number): string => {
  const tailwindColors = [
    'text-blue-600',
    'text-red-600',
    'text-emerald-600',
    'text-amber-600',
    'text-violet-600',
    'text-pink-600',
    'text-teal-600',
    'text-orange-600',
  ]
  return tailwindColors[index % tailwindColors.length]
}
