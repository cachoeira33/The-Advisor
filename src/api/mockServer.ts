// simple mock "backend" saved in localStorage
type User = { id: string; email: string; name?: string; password?: string; accounts: string[] }
type Account = { id: string; name: string; businesses: string[] }
type Business = { id: string; accountId: string; name: string; currency: string; transactions: any[]; createdAt: string }

const KEY_USERS = 'demo_users_v1'
const KEY_ACCOUNTS = 'demo_accounts_v1'
const KEY_BUSINESSES = 'demo_businesses_v1'

if (!localStorage.getItem(KEY_USERS)) {
  const sampleUser: User = { id: 'u_1', email: 'demo@demo.com', name: 'Demo User', password: 'demo123', accounts: ['a_1'] }
  localStorage.setItem(KEY_USERS, JSON.stringify([sampleUser]))
}
if (!localStorage.getItem(KEY_ACCOUNTS)) {
  const sampleAccount: Account = { id: 'a_1', name: 'Demo Account', businesses: ['b_1'] }
  localStorage.setItem(KEY_ACCOUNTS, JSON.stringify([sampleAccount]))
}
if (!localStorage.getItem(KEY_BUSINESSES)) {
  const now = new Date().toISOString()
  const sampleBusiness: Business = {
    id: 'b_1',
    accountId: 'a_1',
    name: 'Demo Business',
    currency: 'USD',
    transactions: [
      { id: 't1', date: '2025-07-01', amount: 5000, type: 'credit', category: 'Sales', description: 'Revenue July' },
      { id: 't2', date: '2025-07-05', amount: -1200, type: 'debit', category: 'Rent', description: 'Office Rent' },
      { id: 't3', date: '2025-08-01', amount: 6000, type: 'credit', category: 'Sales', description: 'Revenue Aug' },
      { id: 't4', date: '2025-08-12', amount: -800, type: 'debit', category: 'Utilities', description: 'Bills' }
    ],
    createdAt: now
  }
  localStorage.setItem(KEY_BUSINESSES, JSON.stringify([sampleBusiness]))
}

// helpers used by frontend
export const api = {
  signup: async (email: string, name: string, password: string) => {
    const users = JSON.parse(localStorage.getItem(KEY_USERS) || '[]') as User[]
    if (users.find(u => u.email === email)) throw new Error('Email already used')
    const id = 'u_' + Date.now()
    const newUser: User = { id, email, name, password, accounts: [] }
    users.push(newUser)
    localStorage.setItem(KEY_USERS, JSON.stringify(users))
    return { user: { id, email, name } }
  },
  login: async (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem(KEY_USERS) || '[]') as User[]
    const u = users.find(x => x.email === email && x.password === password)
    if (!u) throw new Error('Invalid credentials')
    // simple token = user id
    localStorage.setItem('demo_token', u.id)
    return { user: { id: u.id, email: u.email, name: u.name } }
  },
  me: async () => {
    const token = localStorage.getItem('demo_token')
    if (!token) return null
    const users = JSON.parse(localStorage.getItem(KEY_USERS) || '[]') as User[]
    const u = users.find(x => x.id === token)
    if (!u) return null
    const accounts = JSON.parse(localStorage.getItem(KEY_ACCOUNTS) || '[]') as Account[]
    const businesses = JSON.parse(localStorage.getItem(KEY_BUSINESSES) || '[]') as Business[]
    const userAccounts = accounts.filter(a => u.accounts.includes(a.id))
    return { user: { id: u.id, email: u.email, name: u.name }, accounts: userAccounts, businesses: businesses.filter(b => userAccounts.some(a=>a.id===b.accountId)) }
  },
  logout: async () => { localStorage.removeItem('demo_token') },
  listBusinesses: async (accountId?: string) => {
    const businesses = JSON.parse(localStorage.getItem(KEY_BUSINESSES) || '[]') as Business[]
    return businesses.filter(b => !accountId || b.accountId === accountId)
  },
  getBusiness: async (id: string) => {
    const businesses = JSON.parse(localStorage.getItem(KEY_BUSINESSES) || '[]') as Business[]
    return businesses.find(b => b.id === id)
  },
  addTransaction: async (businessId: string, tx: any) => {
    const businesses = JSON.parse(localStorage.getItem(KEY_BUSINESSES) || '[]') as Business[]
    const b = businesses.find(x => x.id === businessId)
    if (!b) throw new Error('Business not found')
    const newTx = { id: 't_' + Date.now(), ...tx }
    b.transactions.push(newTx)
    localStorage.setItem(KEY_BUSINESSES, JSON.stringify(businesses))
    return newTx
  },
  runForecast: async (businessId: string, months = 6, growth = 0.02) => {
    // simplistic forecast: average monthly net * (1+growth)^(n)
    const b = (await api.getBusiness(businessId)) as Business
    if (!b) throw new Error('Business not found')
    // aggregate monthly net
    const byMonth: Record<string, number> = {}
    b.transactions.forEach(t => {
      const m = t.date.slice(0,7)
      byMonth[m] = (byMonth[m] || 0) + Number(t.amount)
    })
    const monthsVals = Object.values(byMonth)
    const avg = monthsVals.reduce((s,n)=>s+n,0) / Math.max(1, monthsVals.length)
    const result = []
    const start = new Date()
    for (let i=1;i<=months;i++){
      const date = new Date(start.getFullYear(), start.getMonth()+i, 1).toISOString().slice(0,10)
      const val = avg * Math.pow(1+growth, i)
      result.push({ date, y: Math.round(val) })
    }
    return { series: result, meta: { avg } }
  }
}
