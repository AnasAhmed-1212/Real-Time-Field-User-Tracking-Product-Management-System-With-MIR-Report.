import type { Metadata } from "next"

import { AdministratorProfile } from "@/components/administrator-profile"

export const metadata: Metadata = { title: "Administrator Profile | Sales Management" }

export default function ProfilePage() { return <AdministratorProfile /> }
