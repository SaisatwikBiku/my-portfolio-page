import { useEffect, useRef, useState } from 'react'
import { adminCall } from './api.js'

// Two steps: mail a code to the owner's address, then type it in. The address
// lives on the server; this screen only ever shows a masked version of it.
export default function AdminLogin({ onSignedIn }) {
  const [step, setStep] = useState('start') // start | sending | sent | verifying
  const [token, setToken] = useState('')
  const [sentTo, setSentTo] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [resendAfter, setResendAfter] = useState(0)
  const [now, setNow] = useState(Date.now())
  const codeRef = useRef(null)

  useEffect(() => {
    if (resendAfter <= now) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [resendAfter, now])

  useEffect(() => {
    if (step === 'sent') codeRef.current?.focus()
  }, [step])

  const sendCode = async () => {
    setStep('sending')
    setError('')
    try {
      const data = await adminCall('request-code')
      setToken(data.token)
      setSentTo(data.sentTo)
      setResendAfter(data.resendAfter)
      setNow(Date.now())
      setCode('')
      setStep('sent')
    } catch (err) {
      setError(err.message)
      setStep(token ? 'sent' : 'start')
    }
  }

  const verify = async (e) => {
    e.preventDefault()
    setStep('verifying')
    setError('')
    try {
      await adminCall('verify-code', { token, code })
      onSignedIn()
    } catch (err) {
      setError(err.message)
      setStep('sent')
      if (err.status === 429 || /expired|new code/i.test(err.message)) setToken('')
    }
  }

  const wait = Math.max(0, Math.ceil((resendAfter - now) / 1000))

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <p className="admin-eyebrow">satwik.info</p>
        <h1>Blog editor</h1>
        {step === 'start' || step === 'sending' || !token ? (
          <>
            <p className="admin-muted">Sign in with a one-time code sent to the site owner's email.</p>
            <button className="btn btn--primary" onClick={sendCode} disabled={step === 'sending' || wait > 0}>
              {step === 'sending' ? 'Sending…' : wait > 0 ? `Send again in ${wait}s` : 'Email me a code'}
            </button>
          </>
        ) : (
          <form onSubmit={verify}>
            <p className="admin-muted">
              Code sent to <strong>{sentTo}</strong>. It works for 10 minutes.
            </p>
            <label className="admin-field">
              <span>8-digit code</span>
              <input
                ref={codeRef}
                className="admin-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={8}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
              />
            </label>
            <div className="admin-row">
              <button className="btn btn--primary" type="submit" disabled={code.length !== 8 || step === 'verifying'}>
                {step === 'verifying' ? 'Checking…' : 'Sign in'}
              </button>
              <button type="button" className="admin-link" onClick={sendCode} disabled={wait > 0}>
                {wait > 0 ? `Resend in ${wait}s` : 'Resend code'}
              </button>
            </div>
          </form>
        )}
        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
