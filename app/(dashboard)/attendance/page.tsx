import type { Metadata } from "next"

import { Attendance } from "@/components/attendance"

export const metadata: Metadata = { title: "Attendance | Sales Management" }

export default function AttendancePage() { return <Attendance /> }
