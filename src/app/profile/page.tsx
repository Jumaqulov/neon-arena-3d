import type { Metadata } from "next";
import ProfileProvider from "@/components/profile/ProfileProvider";
import ProfileHero from "@/components/profile/ProfileHero";
import ProfileCabinet from "@/components/profile/ProfileCabinet";
import FavoriteGames from "@/components/profile/FavoriteGames";

const DESCRIPTION =
  "NEON ARENA a’zo profili: 3D a’zolik kartasi, daraja va tajriba, bronlar, yutuqlar, sevimli o‘yinlar va profil sozlamalari.";

export const metadata: Metadata = {
  title: "Gamer profili",
  description: DESCRIPTION,
  // openGraph is replaced (not merged) per route: repeat locale/type from the root layout
  openGraph: { title: "Gamer profili — NEON ARENA", description: DESCRIPTION, locale: "uz_UZ", type: "website" },
};

/**
 * /profile — member profile.
 *  1. Hero: WebGL arena + 3D member card (tilt, flip to [QR KOD], turns away on scroll)
 *  2. Kabinet: tabs Bronlar / Yutuqlar / Sozlamalar
 *  3. Sevimli o‘yinlar
 * ProfileProvider shares the active tab between the hero ("Profilni tahrirlash") and the cabinet.
 */
export default function ProfilePage() {
  return (
    <ProfileProvider>
      <ProfileHero />
      <ProfileCabinet />
      <FavoriteGames />
    </ProfileProvider>
  );
}
