const stripe = require('stripe')('sk_test_ZluOqOvwXDnfxjOn7c6h2LqO00SVQfjQu0')

const BOT_EDITOR = 'BOT_EDITOR'
const INDIVIDUAL_CUSTOMVAR_CRM_PLAN = 'INDIVIDUAL_CUSTOMVAR_CRM_PLAN'
const INDIVIDUAL_INBOX_PLAN = 'INDIVIDUAL_INBOX_PLAN'
const INDIVIDUAL_TEAM_PLAN = 'INDIVIDUAL_TEAM_PLAN'
const BUSINESS_CUSTOMVAR_CRM_PLAN = 'BUSINESS_CUSTOMVAR_CRM_PLAN'
const BUSINESS_INBOX_PLAN = 'BUSINESS_INBOX_PLAN'
const BUSINESS_TEAM_PLAN = 'BUSINESS_TEAM_PLAN'

const products = [
  {
    id: BOT_EDITOR,
    name: 'BotEditor',
    type: 'service',
    statement_descriptor: 'APPSOCIALLY',
    unit_label: '件'
  }
]

const MONTH = 'month'

const membershipPlans = [
  //   {
  //     id: 'PER_INTERVIEW_PLAN',
  //     interval: MONTH,
  //     product: BOT_EDITOR,
  //     amount: 5000,
  //     usage_type: 'metered'
  //   },
  {
    id: INDIVIDUAL_CUSTOMVAR_CRM_PLAN,
    interval: MONTH,
    product: BOT_EDITOR,
    usage_type: 'licensed',
    amount: 980
    // billing_scheme: 'tiered',
    // tiers_mode: 'graduated',
    // tiers: [{
    //   up_to: 3,
    //   unit_amount: 0
    // }, {
    //   up_to: 'inf',
    //   flat_amount: 1000
    // }]
  },
  {
    id: INDIVIDUAL_INBOX_PLAN,
    interval: MONTH,
    product: BOT_EDITOR,
    usage_type: 'licensed',
    amount: 2980
  },
  {
    id: INDIVIDUAL_TEAM_PLAN,
    interval: MONTH,
    product: BOT_EDITOR,
    usage_type: 'licensed',
    amount: 4980
  },
  {
    id: BUSINESS_CUSTOMVAR_CRM_PLAN,
    interval: MONTH,
    product: BOT_EDITOR,
    usage_type: 'licensed',
    amount: 9800
  },
  {
    id: BUSINESS_INBOX_PLAN,
    interval: MONTH,
    product: BOT_EDITOR,
    usage_type: 'licensed',
    amount: 98000
  },
  {
    id: BUSINESS_TEAM_PLAN,
    interval: MONTH,
    product: BOT_EDITOR,
    usage_type: 'licensed',
    amount: 498000
  }
];

/**
 * Check if all plans exist on stripe already
 */
async function testForEntities () {
  const allLocalPlanIds = membershipPlans.map(p => p.id)
  const plan = await stripe.plans.list()
  const allStripePlanIds = !!plan && !!plan.data ? plan.data.map(p => p.id) : []
  return allLocalPlanIds.every(p => allStripePlanIds.includes(p))
}

async function setupStripe () {
  console.log('Generating products...')
  const productsP = products.map(product => {
    return stripe.products.create(product)
  })

  try {
    await Promise.all(productsP)
  } catch (err) {
    if (err.code !== 'resource_already_exists') {
      throw err
    }
  }

  console.log('Product generation complete!')

  console.log('Generating plans...')
  const plansP = membershipPlans.map(plan => {
    return stripe.plans.create({
      ...plan,
      currency: 'jpy'
    })
  })

  try {
    await Promise.all(plansP)
  } catch (err) {
    if (err.code !== 'resource_already_exists') {
      throw err
    }
  }

  console.log('Plan generation complete!')
}

async function setupStripeIfNecessary () {
  const isSetup = await testForEntities()
  if (!isSetup) {
    return setupStripe()
  } else {
    console.log('Stripe is already setup, skipping setup step.')
  }
}

setupStripeIfNecessary()
