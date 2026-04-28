const replacementMap: Record<string, string> = {
  '32': '\\,',
  's+219': '\\{',
  's+221': '\\}',
  '220': '\\backslash',
  's+51': '\\#',
  's+52': '\\$',
  's+53': '\\%',
  's+54': '\\^',
  's+55': '\\&',
  's+189': '\\_',
  's+192': '\\~',
};

export const legacyInputFilter = {
  getReplaceString(key: string | number) {
    return replacementMap[String(key)] || null;
  },
};
