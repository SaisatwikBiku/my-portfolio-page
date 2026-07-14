import { useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import Section from './Section.jsx'
import { profile, socials, emailjsConfig } from '../data/portfolio.js'

// Simple shape check: something@something.tld. Stricter than the browser's
// type="email" validation, which accepts addresses without a dot (a@b).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function Contact() {
  const formRef = useRef(null)
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [emailError, setEmailError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const email = formRef.current.email.value.trim()
    if (!EMAIL_RE.test(email)) {
      setEmailError('Please enter a valid email address, like you@example.com.')
      formRef.current.email.focus()
      return
    }
    setEmailError('')
    setStatus('sending')
    emailjs
      .sendForm(emailjsConfig.serviceId, emailjsConfig.templateId, formRef.current, {
        publicKey: emailjsConfig.publicKey,
      })
      .then(() => {
        setStatus('success')
        formRef.current.reset()
      })
      .catch(() => setStatus('error'))
  }

  return (
    <Section
      id="contact"
      title="Get In Touch"
      eyebrow="Contact"
      num="06"
      lead="Every good story leaves room for a next chapter — say hi."
      className="contact"
    >
      <div className="contact-grid">
        <div className="contact-info">
          <p>
            Have a role, a project, or just want to talk shop? I'm always open to interesting problems
            and good conversations.
          </p>
          <ul className="contact-details">
            <li>
              <span>Email</span>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </li>
            <li>
              <span>Phone</span>
              <a href={`tel:${profile.phone.replace(/\s/g, '')}`}>{profile.phone}</a>
            </li>
            <li>
              <span>Location</span>
              <p>{profile.location}</p>
            </li>
          </ul>
          <div className="contact-socials">
            {socials.map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noreferrer" title={s.name} aria-label={s.name}>
                <img src={s.icon} alt={s.name} />
              </a>
            ))}
          </div>
        </div>

        {status === 'success' ? (
          <div className="contact-success">
            <h3>Thank you! 🎉</h3>
            <p>Your message has been sent. I'll get back to you soon.</p>
            <button className="btn btn--ghost" onClick={() => setStatus('idle')}>
              Send another
            </button>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="contact-form">
            <input type="text" name="name" placeholder="Your Name" required />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              required
              aria-invalid={!!emailError}
              className={emailError ? 'input-error' : ''}
              onChange={() => emailError && setEmailError('')}
            />
            {emailError && (
              <p className="contact-field-error" role="alert">
                {emailError}
              </p>
            )}
            <textarea name="message" rows="5" placeholder="Your Message" required />
            <button type="submit" className="btn btn--primary" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>
            {status === 'error' && (
              <p className="contact-error">Oops! Something went wrong. Please try again or email me directly.</p>
            )}
          </form>
        )}
      </div>
    </Section>
  )
}
