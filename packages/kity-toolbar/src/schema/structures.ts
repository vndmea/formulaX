export interface StructureItem {
  id: string;
  label: string;
  latex: string;
  category: string;
  hasDropdown?: boolean;
}

export interface StructureCategory {
  id: string;
  label: string;
  structures: StructureItem[];
}

export const FRACTIONS_CATEGORY: StructureCategory = {
  id: 'fractions',
  label: 'Fraction',
  structures: [
    { id: 'frac', label: 'Fraction', latex: '\\frac{}{}', category: 'fractions' },
  ],
};

export const SUBSUP_CATEGORY: StructureCategory = {
  id: 'subsup',
  label: 'Sub/Sup',
  structures: [
    { id: 'sup', label: 'Superscript', latex: '^{}', category: 'subsup' },
    { id: 'sub', label: 'Subscript', latex: '_{}', category: 'subsup' },
    { id: 'supsub', label: 'Sub & Sup', latex: '_{}^{}', category: 'subsup', hasDropdown: true },
  ],
};

export const ROOT_CATEGORY: StructureCategory = {
  id: 'root',
  label: 'Root',
  structures: [
    { id: 'sqrt', label: 'Square Root', latex: '\\sqrt{}', category: 'root' },
    { id: 'nthroot', label: 'N-th Root', latex: '\\sqrt[]{}', category: 'root', hasDropdown: true },
  ],
};

export const INTEGRAL_CATEGORY: StructureCategory = {
  id: 'integral',
  label: 'Integral',
  structures: [
    { id: 'int', label: 'Integral', latex: '\\int', category: 'integral' },
    { id: 'iint', label: 'Double', latex: '\\iint', category: 'integral' },
    { id: 'oint', label: 'Contour', latex: '\\oint', category: 'integral' },
  ],
};

export const SUM_CATEGORY: StructureCategory = {
  id: 'sum',
  label: 'Sum',
  structures: [
    { id: 'sum', label: 'Sum', latex: '\\sum', category: 'sum' },
    { id: 'prod', label: 'Product', latex: '\\prod', category: 'sum' },
  ],
};

export const STRUCTURE_CATEGORIES: StructureCategory[] = [
  FRACTIONS_CATEGORY,
  SUBSUP_CATEGORY,
  ROOT_CATEGORY,
  INTEGRAL_CATEGORY,
  SUM_CATEGORY,
];
