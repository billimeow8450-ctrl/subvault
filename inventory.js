export function parseCredentials(text) {
  return text.split(/\r?\n/).flatMap(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return [];
    // Split at the first separator, preserving punctuation within the password.
    const match = trimmed.match(/^([^:|,\s]+)\s*[:|,\s]\s*(.+)$/);
    if (!match || !match[2].trim()) return [];
    return [{ email: match[1], password: match[2].trim() }];
  });
}
export function grossRevenue(accounts) {
  return accounts.filter(a=>a.status==='sold').reduce((sum,a)=>sum+Math.round((Number(a.soldPrice)||0)*100),0)/100;
}
