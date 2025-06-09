import { getBaseURL } from "./BaseURL";

export async function login(email: string, password:string) : Promise<boolean>{
  const response = await fetch(`${getBaseURL()}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.text();
  if (data) {
    localStorage.setItem('token', data);
    return true;
  }

  return false;
}

export function logout(): void {
  localStorage.removeItem('token');
}

export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null; // No localStorage in server-side rendering
  }
  return localStorage.getItem('token');
}

export function isAuthenticated(): boolean {
  const token = getToken();
  return token !== null && token !== '';
}

export function setViewAsCustomer(toggle: boolean): void {
  if (typeof window === 'undefined') return; // No localStorage in server-side rendering
  localStorage.setItem('viewAsCustomer', String(toggle));
}

export function isViewAsCustomer(): boolean {
  if (typeof window === 'undefined') return false; // No localStorage in server-side rendering
  const viewAsCustomer = localStorage.getItem('viewAsCustomer');
  return viewAsCustomer === 'true' || viewAsCustomer === '1';
}

export function isEmployee(forceViewAsCustomerOff: boolean = false): boolean {
  const token = getToken();
  if (!token) return false;

  // If forceViewAsCustomerOff is false and viewAsCustomer is enabled, treat as not employee
  if (!forceViewAsCustomerOff && isViewAsCustomer()) {
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.employee === 'true' || payload.employee === true;
  } catch (err) {
    console.error('Failed to parse token:', err);
    return false;
  }
}
  

export function callAuthenticatedApi(
  endpoint: string,
  options: RequestInit = {},
  redirectTo: string | null = '/login',
  onRedirect?: () => void,
  baseURL: string = getBaseURL() + '/api/'
): Promise<Response> {
  const token = getToken();

  if (!token) {
    if (redirectTo) {
      if (onRedirect) onRedirect();
      window.location.href = redirectTo;
    }
    return Promise.reject(new Error('Not authenticated'));
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  return fetch(`${baseURL}${endpoint}`, {
    ...options,
    headers,
  }).then(res => {
    if (res.status === 401) {
      if (redirectTo) {
        if (onRedirect) onRedirect();
        window.location.href = redirectTo;
      }
      throw new Error('Unauthorized');
    }
    return res;
  });
}

export async function protectRoute(authenticated:boolean, employeeOnly:boolean = false, redirectTo:string = '/login', onRedirect?:() => void): Promise<boolean> {
  if (isAuthenticated() != authenticated) {
    if (onRedirect) onRedirect();
    window.location.href = redirectTo;
    return false;
  }
  if (employeeOnly && !isEmployee()) {
    if (onRedirect) onRedirect();
    window.location.href = redirectTo;
    return false;
  }
  // If authenticated and not employee-only, do nothing
  return false
}

export async function getUserDetails() : Promise<Response> {
  const token = getToken();

  if (!token) {
    return Promise.reject(new Error('Not authenticated'));
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
  };

  return fetch(`${getBaseURL()}/api/user/myinfo`, {
    headers,
  }).then(res => {
    if (res.status === 401) {
      return Promise.reject(new Error('Unauthorized'))
    }
    return res;
  });
}