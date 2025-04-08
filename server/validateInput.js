export function validateSignupInput(data) {
    const {
      firstName,
      lastName,
      businessName,
      businessEmail,
      username,
      password,
    } = data;
  
    if (!firstName || typeof firstName !== 'string' || firstName.trim() === '') {
      return { isValid: false, message: 'First name is required' };
    }
    if (!lastName || typeof lastName !== 'string' || lastName.trim() === '') {
      return { isValid: false, message: 'Last name is required' };
    }
    if (!businessName || typeof businessName !== 'string' || businessName.trim() === '') {
      return { isValid: false, message: 'Business name is required' };
    }
    if (
      !businessEmail ||
      typeof businessEmail !== 'string' ||
      !/^\S+@\S+\.\S+$/.test(businessEmail)
    ) {
      return { isValid: false, message: 'A valid business email is required' };
    }
    if (!username || typeof username !== 'string' || username.trim() === '') {
      return { isValid: false, message: 'Username is required' };
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }
    return { isValid: true };
  }
  
  export function validateLoginInput(data) {
    const { username, password } = data;
    if (!username || typeof username !== 'string' || username.trim() === '') {
      return { isValid: false, message: 'Username is required' };
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }
    return { isValid: true };
  }