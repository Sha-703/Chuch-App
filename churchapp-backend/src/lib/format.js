export function formatFC(montant) {
  // Espace normal en séparateur de milliers (l'espace insécable fine du
  // format Intl 'fr-CD' ne s'affiche pas correctement avec les polices PDF standard).
  const entier = Math.round(montant)
  const avecEspaces = entier.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${avecEspaces} FC`
}
