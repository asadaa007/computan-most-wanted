import slugify from 'slugify';

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  gender: string;
  dateOfBirth: string;
  age: number;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  experience: string;
  education: string;
  bio: string;
  image: string;
  linkedin: string;
  github: string;
  portfolio: string;
  isActive: boolean;
  joinDate: string;
  lastModified: string;
  flag: string;
}

export const createSlug = (text: string): string => {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true
  });
};

export const createPersonSlug = (name: string): string => {
  return createSlug(name);
};

// Since we're not using ID in the slug, we need to find the person by name
// This function will be used to find a person by their slug (name)
export const findPersonBySlug = (employees: Employee[], slug: string) => {
  return employees.find(employee => createSlug(employee.name) === slug);
}; 