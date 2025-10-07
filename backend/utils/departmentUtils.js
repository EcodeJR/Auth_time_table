// Department standardization utility
// This ensures consistent department naming across the entire system

// Standard department names (these are the canonical names)
export const STANDARD_DEPARTMENTS = [
  'computer science',
  'mathematics', 
  'physics',
  'chemistry',
  'biology',
  'electrical engineering',
  'mechanical engineering',
  'civil engineering',
  'chemical engineering',
  'petroleum engineering',
  'agricultural engineering',
  'biomedical engineering',
  'computer engineering',
  'software engineering',
  'information technology',
  'cybersecurity',
  'data science',
  'artificial intelligence',
  'business administration',
  'accounting',
  'economics',
  'finance',
  'marketing',
  'human resources',
  'psychology',
  'sociology',
  'political science',
  'international relations',
  'law',
  'medicine',
  'pharmacy',
  'nursing',
  'dentistry',
  'veterinary medicine',
  'architecture',
  'urban planning',
  'fine arts',
  'graphic design',
  'music',
  'theater',
  'journalism',
  'mass communication',
  'education',
  'linguistics',
  'literature',
  'history',
  'philosophy',
  'geography',
  'environmental science',
  'geology',
  'astronomy',
  'statistics',
  'actuarial science'
];

// Department mapping for common variations and aliases
export const DEPARTMENT_MAPPING = {
  // Computer Science variations
  'cs': 'computer science',
  'computing': 'computer science',
  'computer science': 'computer science',
  'comp sci': 'computer science',
  'csci': 'computer science',
  'cse': 'computer science',
  'software engineering': 'software engineering',
  'se': 'software engineering',
  'computer engineering': 'computer engineering',
  'ce': 'computer engineering',
  'it': 'information technology',
  'information technology': 'information technology',
  'cybersecurity': 'cybersecurity',
  'data science': 'data science',
  'ai': 'artificial intelligence',
  'artificial intelligence': 'artificial intelligence',
  
  // Engineering variations
  'electrical': 'electrical engineering',
  'electrical engineering': 'electrical engineering',
  'ee': 'electrical engineering',
  'mechanical': 'mechanical engineering', 
  'mechanical engineering': 'mechanical engineering',
  'me': 'mechanical engineering',
  'civil': 'civil engineering',
  'civil engineering': 'civil engineering',
  'chemical': 'chemical engineering',
  'chemical engineering': 'chemical engineering',
  'petroleum': 'petroleum engineering',
  'petroleum engineering': 'petroleum engineering',
  'agricultural': 'agricultural engineering',
  'agricultural engineering': 'agricultural engineering',
  'biomedical': 'biomedical engineering',
  'biomedical engineering': 'biomedical engineering',
  
  // Business variations
  'business': 'business administration',
  'business administration': 'business administration',
  'ba': 'business administration',
  'mba': 'business administration',
  'accounting': 'accounting',
  'acc': 'accounting',
  'economics': 'economics',
  'econ': 'economics',
  'finance': 'finance',
  'fin': 'finance',
  'marketing': 'marketing',
  'mkt': 'marketing',
  'hr': 'human resources',
  'human resources': 'human resources',
  
  // Science variations
  'math': 'mathematics',
  'mathematics': 'mathematics',
  'physics': 'physics',
  'chem': 'chemistry',
  'chemistry': 'chemistry',
  'bio': 'biology',
  'biology': 'biology',
  'psych': 'psychology',
  'psychology': 'psychology',
  'soc': 'sociology',
  'sociology': 'sociology',
  'poli sci': 'political science',
  'political science': 'political science',
  'ir': 'international relations',
  'international relations': 'international relations',
  
  // Health variations
  'med': 'medicine',
  'medicine': 'medicine',
  'pharm': 'pharmacy',
  'pharmacy': 'pharmacy',
  'nursing': 'nursing',
  'dentistry': 'dentistry',
  'vet': 'veterinary medicine',
  'veterinary medicine': 'veterinary medicine',
  
  // Arts variations
  'arch': 'architecture',
  'architecture': 'architecture',
  'urban planning': 'urban planning',
  'fine arts': 'fine arts',
  'graphic design': 'graphic design',
  'music': 'music',
  'theater': 'theater',
  'theatre': 'theater',
  'journalism': 'journalism',
  'mass comm': 'mass communication',
  'mass communication': 'mass communication',
  
  // Education variations
  'education': 'education',
  'edu': 'education',
  'linguistics': 'linguistics',
  'lit': 'literature',
  'literature': 'literature',
  'history': 'history',
  'phil': 'philosophy',
  'philosophy': 'philosophy',
  'geo': 'geography',
  'geography': 'geography',
  'env sci': 'environmental science',
  'environmental science': 'environmental science',
  'geology': 'geology',
  'astro': 'astronomy',
  'astronomy': 'astronomy',
  'stats': 'statistics',
  'statistics': 'statistics',
  'actuarial': 'actuarial science',
  'actuarial science': 'actuarial science'
};

/**
 * Normalizes a department name to its standard form
 * @param {string} department - The department name to normalize
 * @returns {string} - The standardized department name
 */
export function normalizeDepartment(department) {
  if (!department || typeof department !== 'string') {
    return null;
  }
  
  // Convert to lowercase and trim whitespace
  const normalized = department.toLowerCase().trim();
  
  // Check if it's already a standard department
  if (STANDARD_DEPARTMENTS.includes(normalized)) {
    return normalized;
  }
  
  // Check mapping for variations
  if (DEPARTMENT_MAPPING[normalized]) {
    return DEPARTMENT_MAPPING[normalized];
  }
  
  // If no mapping found, return the normalized version
  // This allows for new departments to be added dynamically
  return normalized;
}

/**
 * Validates if a department name is recognized
 * @param {string} department - The department name to validate
 * @returns {boolean} - True if the department is recognized
 */
export function isValidDepartment(department) {
  const normalized = normalizeDepartment(department);
  return STANDARD_DEPARTMENTS.includes(normalized);
}

/**
 * Gets all standard department names
 * @returns {Array<string>} - Array of standard department names
 */
export function getStandardDepartments() {
  return [...STANDARD_DEPARTMENTS];
}

/**
 * Gets department mapping for frontend dropdowns
 * @returns {Array<{value: string, label: string}>} - Array of department options
 */
export function getDepartmentOptions() {
  return STANDARD_DEPARTMENTS.map(dept => ({
    value: dept,
    label: dept.charAt(0).toUpperCase() + dept.slice(1).replace(/\b\w/g, l => l.toUpperCase())
  }));
}

