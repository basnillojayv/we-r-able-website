import type { Metadata } from 'next'
import { EditLogin } from '../components/EditLogin'

/**
 * Static like every other page here, and for the same reason: nothing on it
 * depends on who is asking. The one question that does — "are you already
 * signed in?" — is asked from the browser afterwards, exactly as the editor
 * itself asks it.
 */
export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Sign in to edit',
  /**
   * robots.ts disallows this path as well. Both are worth having: robots.txt
   * stops a crawler that reads it, and this stops one that arrives by a direct
   * link and never looks.
   */
  robots: { index: false, follow: false },
}

/**
 * The staff way in.
 *
 * /admin is untouched and still opens the Payload dashboard, which is where
 * projects, lots, updates and rich text belong. This is the other door: sign
 * in, land on the homepage, change the wording where it sits.
 */
export default function EditPage() {
  return (
    <section className="section section--tight">
      <div className="wrap">
        <EditLogin />
      </div>
    </section>
  )
}
