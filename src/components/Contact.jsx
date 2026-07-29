import { useEffect, useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import Section from './Section.jsx'
import { profile, socials, emailjsConfig } from '../data/portfolio.js'

// Simple shape check: something@something.tld. Stricter than the browser's
// type="email" validation, which accepts addresses without a dot (a@b).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// One-time passcode state. `email` is the address the current code was mailed
// to — if the visitor edits the field afterwards the code no longer applies, so
// the whole thing resets.
const NO_CODE = { stage: 'idle', email: '', token: '', expiresAt: 0, resendAfter: 0, code: '', error: '' }

async function postOtp(payload) {
  const res = await fetch('/api/otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || 'Something went wrong. Please try again.')
    err.expired = !!data.expired
    throw err
  }
  return data
}

function countdown(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

export default function Contact() {
  const formRef = useRef(null)
  const codeRef = useRef(null)
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [emailError, setEmailError] = useState('')
  const [email, setEmail] = useState('')
  const [verifiedEmail, setVerifiedEmail] = useState('')
  const [otp, setOtp] = useState(NO_CODE)
  const [now, setNow] = useState(() => Date.now())

  const address = email.trim().toLowerCase()
  const looksLikeEmail = EMAIL_RE.test(address)
  const isVerified = !!verifiedEmail && verifiedEmail === address
  const awaitingCode = otp.stage === 'sent' || otp.stage === 'verifying'
  const expired = awaitingCode && now >= otp.expiresAt
  const resendIn = Math.max(0, otp.resendAfter - now)

  // Only tick while something on screen is counting down.
  useEffect(() => {
    if (!awaitingCode) return undefined
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [awaitingCode])

  useEffect(() => {
    if (otp.stage === 'sent') codeRef.current?.focus()
  }, [otp.stage])

  const handleEmailChange = (e) => {
    const next = e.target.value
    setEmail(next)
    if (emailError) setEmailError('')
    // A code is bound to the address it was sent to; editing invalidates it.
    if (otp.stage !== 'idle' && next.trim().toLowerCase() !== otp.email) setOtp(NO_CODE)
  }

  const requestCode = async () => {
    if (!looksLikeEmail) {
      setEmailError('Please enter a valid email address, like you@example.com.')
      formRef.current.email.focus()
      return
    }
    setEmailError('')
    setOtp((prev) => ({ ...prev, stage: 'sending', code: '', error: '' }))
    try {
      const data = await postOtp({ email: address, name: formRef.current.name.value.trim() })
      setNow(Date.now())
      setOtp({
        stage: 'sent',
        email: address,
        token: data.token,
        expiresAt: data.expiresAt,
        resendAfter: data.resendAfter,
        code: '',
        error: '',
      })
    } catch (err) {
      setOtp((prev) => ({ ...prev, stage: prev.token ? 'sent' : 'idle', error: err.message }))
    }
  }

  const verifyCode = async () => {
    if (otp.code.length !== 6) {
      setOtp((prev) => ({ ...prev, error: 'Enter the 6-digit code from your inbox.' }))
      return
    }
    setOtp((prev) => ({ ...prev, stage: 'verifying', error: '' }))
    try {
      await postOtp({ action: 'verify', email: otp.email, code: otp.code, token: otp.token })
      setVerifiedEmail(otp.email)
      setOtp(NO_CODE)
    } catch (err) {
      // A burnt-out code (expired or out of attempts) can't be retried — drop
      // back to the "send me a code" state and keep the reason on screen.
      setOtp((prev) =>
        err.expired ? { ...NO_CODE, error: err.message } : { ...prev, stage: 'sent', error: err.message },
      )
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!looksLikeEmail) {
      setEmailError('Please enter a valid email address, like you@example.com.')
      formRef.current.email.focus()
      return
    }
    if (!isVerified) {
      setEmailError('Please verify your email address before sending.')
      if (awaitingCode) codeRef.current?.focus()
      else formRef.current.email.focus()
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
        setEmail('')
        setVerifiedEmail('')
        setOtp(NO_CODE)
      })
      .catch(() => setStatus('error'))
  }

  return (
    <Section
      id="contact"
      title="Get In Touch"
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

            <div className="contact-email-row">
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                required
                value={email}
                onChange={handleEmailChange}
                aria-invalid={!!emailError}
                className={emailError ? 'input-error' : ''}
              />
              {isVerified ? (
                <span className="otp-verified" role="status">
                  <span aria-hidden="true">✓</span> Verified
                </span>
              ) : (
                <button
                  type="button"
                  className="btn btn--ghost btn--inline"
                  onClick={requestCode}
                  disabled={!looksLikeEmail || otp.stage === 'sending' || resendIn > 0}
                >
                  {otp.stage === 'sending'
                    ? 'Sending…'
                    : resendIn > 0
                      ? `Resend ${countdown(resendIn)}`
                      : otp.token
                        ? 'Resend'
                        : 'Verify'}
                </button>
              )}
            </div>

            {emailError && (
              <p className="contact-field-error" role="alert">
                {emailError}
              </p>
            )}

            {awaitingCode && (
              <div className="otp-panel">
                <p className="otp-hint">
                  {expired ? (
                    <>That code has expired — send yourself a new one.</>
                  ) : (
                    <>
                      Enter the 6-digit code sent to <strong>{otp.email}</strong>. It expires in{' '}
                      {countdown(otp.expiresAt - now)}.
                    </>
                  )}
                </p>
                <div className="otp-row">
                  <input
                    ref={codeRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="000000"
                    aria-label="Verification code"
                    className="otp-input"
                    value={otp.code}
                    disabled={expired}
                    onChange={(e) =>
                      setOtp((prev) => ({ ...prev, code: e.target.value.replace(/\D/g, '').slice(0, 6), error: '' }))
                    }
                    onKeyDown={(e) => {
                      // Enter inside a form would submit it; verify instead.
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (!expired) verifyCode()
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn--primary btn--inline"
                    onClick={verifyCode}
                    disabled={expired || otp.stage === 'verifying' || otp.code.length !== 6}
                  >
                    {otp.stage === 'verifying' ? 'Checking…' : 'Confirm'}
                  </button>
                </div>
              </div>
            )}

            {otp.error && (
              <p className="contact-field-error" role="alert">
                {otp.error}
              </p>
            )}

            {/* The message box stays shut until the address is confirmed, so
                nobody types out a paragraph and only then meets the gate. */}
            <textarea
              name="message"
              rows="5"
              required
              disabled={!isVerified}
              aria-describedby={isVerified ? undefined : 'contact-gate-note'}
              placeholder={isVerified ? 'Your Message' : 'Verify your email to write a message'}
            />
            <button
              type="submit"
              className="btn btn--primary"
              disabled={status === 'sending' || !isVerified}
            >
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>
            {!isVerified && (
              <p className="otp-gate-note" id="contact-gate-note">
                Verify your email address to write and send a message.
              </p>
            )}
            {status === 'error' && (
              <p className="contact-error">Oops! Something went wrong. Please try again or email me directly.</p>
            )}
          </form>
        )}
      </div>
    </Section>
  )
}
