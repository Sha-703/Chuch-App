// Code à usage unique (OTP) à 6 chiffres, utilisé comme identifiant provisoire
// lors de la création d'un compte (église, ouvrier, communauté). L'utilisateur
// doit le remplacer par son propre mot de passe dès sa première connexion
// (voir Utilisateur.motDePasseDoitEtreChange et la page Paramètres).
export function genererOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
