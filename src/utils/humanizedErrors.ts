/**
 * Humanized Error Translator
 * Translates raw API, Firebase, network, and runtime system errors
 * into warm, empathetic, conversational human language.
 */

export interface HumanizedError {
  title: string;
  message: string;
  actionHint: string;
}

export function humanizeError(rawError: any): HumanizedError {
  const errString = typeof rawError === 'string'
    ? rawError
    : rawError?.message || JSON.stringify(rawError || '');

  const lower = errString.toLowerCase();

  // 1. High AI Traffic / Model Unavailable / 503
  if (
    lower.includes('503') ||
    lower.includes('high demand') ||
    lower.includes('unavailable') ||
    lower.includes('resource_exhausted') ||
    lower.includes('rate limit')
  ) {
    return {
      title: 'AI Generator Taking a Quick Breather ☕',
      message: "Our AI creation engine is experiencing a rush of teachers creating lessons right now! Don't worry—your lesson material and preferences are 100% saved.",
      actionHint: "Click 'Try Again' in a few seconds and we'll generate your slides immediately!",
    };
  }

  // 2. Network / Connectivity / Offline
  if (
    lower.includes('network') ||
    lower.includes('offline') ||
    lower.includes('failed to fetch') ||
    lower.includes('connection')
  ) {
    return {
      title: 'Internet Connection Blinked 🌐',
      message: "It looks like your internet connection lost signal for a moment. No stress—all your slides and draft notes are backed up safely in your browser.",
      actionHint: 'Check your connection and click retry when you are ready to continue.',
    };
  }

  // 3. Auth: Wrong Password / Invalid Credentials
  if (
    lower.includes('invalid-credential') ||
    lower.includes('wrong-password') ||
    lower.includes('invalid password') ||
    lower.includes('user-not-found')
  ) {
    return {
      title: 'Account Check Needed 🔑',
      message: "We couldn't match that email and password combination. Please double-check for typos in your email or password.",
      actionHint: "If you don't have an account yet, click 'Create account' below to sign up instantly!",
    };
  }

  // 4. Auth: Email Already In Use
  if (lower.includes('email-already-in-use')) {
    return {
      title: 'Account Already Exists ✨',
      message: "An account with this email is already registered in our app database.",
      actionHint: "Enter your password to sign in and access your past lesson decks!",
    };
  }

  // 5. Auth: Operation Not Allowed / Disabled
  if (lower.includes('operation-not-allowed')) {
    return {
      title: 'Sign In Method Notice 💡',
      message: "Direct email login is taking a quick pause on this server setup. You can log in effortlessly using 'Continue with Google' above!",
      actionHint: "Click 'Continue with Google' for 1-click access.",
    };
  }

  // 6. File / Document Extraction Errors
  if (
    lower.includes('file') ||
    lower.includes('document') ||
    lower.includes('parse') ||
    lower.includes('extract')
  ) {
    return {
      title: 'Document Reading Hiccup 📄',
      message: "We couldn't extract readable text from that specific file layout. Don't worry, your original file is safe on your computer!",
      actionHint: 'Try copying and pasting your lesson text into the "Paste Text" tab or upload a .pdf / .txt file.',
    };
  }

  // 7. Short Content
  if (lower.includes('content') || lower.includes('sufficient') || lower.includes('short')) {
    return {
      title: 'A Bit More Detail Needed ✍️',
      message: "We need just a little more lesson material to craft a complete set of presentation slides for your class.",
      actionHint: 'Add a few more sentences or bullet points about your lesson topic and try again!',
    };
  }

  // 8. Visual / SVG / Image Generation Errors
  if (lower.includes('visual') || lower.includes('illustration') || lower.includes('svg') || lower.includes('image')) {
    return {
      title: 'Visual Artist Pause 🎨',
      message: "Our AI illustration assistant paused while painting this slide graphic.",
      actionHint: "Click 'Regenerate Art' to create a fresh custom artwork for this slide!",
    };
  }

  // 9. Export / PPTX Errors
  if (lower.includes('export') || lower.includes('pptx') || lower.includes('download')) {
    return {
      title: 'Slide Export Polish 📊',
      message: "We ran into a small formatting bump while packaging your PowerPoint presentation.",
      actionHint: "Click 'Export PPTX' again or try 'Copy Slide Content' as a fast alternative!",
    };
  }

  // 10. Default Friendly Catch-All
  return {
    title: 'A Friendly Little Bump in the Road 🌟',
    message: "Something unexpected happened behind the scenes, but your work and presentation settings are completely safe.",
    actionHint: "Please try your action again in a moment. We're right here to help you build great lessons!",
  };
}
