import {
  LayoutGrid, Landmark, CalendarDays, FileBarChart, Users2, Mail,
  Megaphone, CalendarClock, Boxes, Settings, User, Building2, Wallet,
} from 'lucide-react'

// Navigation complète = direction de l'église (pasteur / administrateur)
const LIENS_ADMIN = [
  { to: '/dashboard', label: 'Vue d\u2019ensemble', icon: LayoutGrid },
  { to: '/finances', label: 'Finances', icon: Landmark },
  { to: '/cultes', label: 'Cultes & présence', icon: CalendarDays },
  { to: '/ressources-humaines', label: 'Ressources Humaines', icon: Users2 },
  { to: '/planning', label: 'Planning', icon: CalendarClock },
  { to: '/logistique', label: 'Logistique', icon: Boxes },
  { to: '/parametres', label: 'Paramètres', icon: Settings },
  { to: '/correspondance', label: 'Correspondance', icon: Mail },
  { to: '/annonces', label: 'Annonces', icon: Megaphone },
  { to: '/rapports', label: 'Rapports', icon: FileBarChart },
]

const LIEN_PARAMETRES = LIENS_ADMIN.find((l) => l.to === '/parametres')

// Espace privé de chaque rôle non-admin
const ESPACES_PRIVES = {
  ouvrier: { to: '/mon-espace', label: 'Mon espace', icon: User },
  chef_departement: { to: '/mon-departement', label: 'Mon département', icon: Building2 },
  tresorier: { to: '/mon-tresorier', label: 'Mes finances', icon: Wallet },
}

const ROLES_ADMIN = ['pasteur', 'administrateur']

// Navigation visible selon le rôle :
//  • pasteur / administrateur → tout le menu de l'église
//  • chef de département, trésorier, ouvrier → leur espace privé + Paramètres
//    (rien de l'administration n'apparaît jamais dans leur navbar)
//  • communauté → Paramètres en secours (elle utilise CommunauteLayout)
export function liensPourRole(role) {
  if (ROLES_ADMIN.includes(role)) return LIENS_ADMIN
  const espace = ESPACES_PRIVES[role]
  return [...(espace ? [espace] : []), LIEN_PARAMETRES]
}
