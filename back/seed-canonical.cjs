/**
 * Idempotent homepage defaults: original leadership + portfolio (two tabs + items).
 * Used by `scripts/bootstrap-db.cjs` and by the API on startup so `/api/leadership` and `/api/portfolio` are populated.
 * Inserts missing rows only — existing admin edits are not overwritten on restart.
 *
 * Leadership rows use DB column `name` (display name). `photo_path` is not seeded from files:
 * after upsert, `photo_path` is set to `leadership-{id}` for every row (see end of `ensureCanonicalLeadership`).
 * Photos on disk: `front/img/leadership/leadership-{id}.png` (legacy `front/img/leadership-{id}.png` still works via API fallback).
 */

/** Original homepage leadership (matches former static section). */
const CANONICAL_LEADERSHIP = [
  {
    name: 'Founder / CEO',
    roleTitle: 'CEO · U.S. citizen',
    blurb:
      'A U.S. citizen and seasoned executive will fill this seat—trusted by serious clients, experienced scaling SaaS, and committed to durable quality over shortcuts. Until a hire, delivery and engineering leadership stay with the CTO and Tech Lead profiled here.',
    badgeLabel: null,
    cardAria: 'Founder / CEO',
    ctaLabel: null,
    ctaAria: null,
    ctaPath: null,
    openSeat: 0,
    sortOrder: 0
  },
  {
    name: 'Adrian Lee',
    roleTitle: 'CTO',
    blurb:
      'Bridges deep engineering judgment and executive realism: clear tradeoffs, honest roadmaps, and systems built to stay reliable well after launch. Turns business urgency into architecture and delivery plans that stay ambitious yet maintainable as the product scales.',
    badgeLabel: null,
    cardAria: 'Adrian Lee, CTO',
    ctaLabel: null,
    ctaAria: null,
    ctaPath: null,
    openSeat: 0,
    sortOrder: 1
  },
  {
    name: 'Jason Lim',
    roleTitle: 'Tech Lead',
    blurb:
      'Stays close to the work in reviews, technical spikes, and performance tuning, with proven depth across modern web stacks, AI integrations, Unity, and C++. Raises engineering quality through patient mentoring and clear standards, while avoiding heavyweight process that would slow the release cadence.',
    badgeLabel: null,
    cardAria: 'Jason Lim, Tech Lead',
    ctaLabel: null,
    ctaAria: null,
    ctaPath: null,
    openSeat: 0,
    sortOrder: 2
  }
];

/**
 * tabSortIndex 0 = first tab (Web), 1 = second tab (Games / AR) — matches default sort_order.
 * image_path on insert is synced on API start (`portfolio-{id}`); thumbnails are served only if the file exists at
 * front/img/portfolio/portfolio-{id}.png.
 */
const CANONICAL_PORTFOLIO_ITEMS = [
  {
    tabSortIndex: 0,
    title: 'Youtopia',
    subtitle: 'Web Development',
    description:
      'Precision nourishment automation (PNA): AI-matched meals and diagnostics for personalized nutrition and health.',
    image_path: '',
    link_url: 'https://www.youtopia.com/',
    sort_order: 0
  },
  {
    tabSortIndex: 0,
    title: 'Oohyeah',
    subtitle: 'Web Development',
    description:
      'Commission-free music platform for artists—sell tracks and merch, fan subscriptions, and built-in marketing tools.',
    image_path: '',
    link_url: 'https://oohyeah.app/',
    sort_order: 1
  },
  {
    tabSortIndex: 0,
    title: 'Howtube',
    subtitle: 'Web Development',
    description:
      'On-demand video platform for conferences, courses, and creator channels—premium education and livestream replays.',
    image_path: '',
    link_url: 'https://www.howtube.com/',
    sort_order: 2
  },
  {
    tabSortIndex: 0,
    title: 'Metronect',
    subtitle: 'Web Development',
    description:
      'Smart building management: tenants, leases, maintenance, packages, SMS/app alerts, and staff tools in one cloud system.',
    image_path: '',
    link_url: 'https://www.metronect.com/',
    sort_order: 3
  },
  {
    tabSortIndex: 0,
    title: 'Kindertales',
    subtitle: 'Web Development',
    description:
      'Childcare management software—attendance, billing, family messaging, and reporting for centers and multi-site operators.',
    image_path: '',
    link_url: 'https://www.kindertales.com/',
    sort_order: 4
  },
  {
    tabSortIndex: 0,
    title: 'Search4Less',
    subtitle: 'Web Development',
    description:
      'Ireland and UK business intelligence—company, director, and risk data with simple annual pricing for due diligence.',
    image_path: '',
    link_url: 'https://search4less.com/',
    sort_order: 5
  },
  {
    tabSortIndex: 1,
    title: 'Eternal Sword Pact',
    subtitle: null,
    description:
      'Mobile RPG inspired by the Shan Hai Jing—mythic world, familiars, co-op boss raids, and tactical combat.',
    image_path: '',
    link_url: 'https://play.google.com/store/apps/details?id=com.mten.tgp&hl=en_US',
    sort_order: 0
  },
  {
    tabSortIndex: 1,
    title: 'Moba League: PvP Trainer',
    subtitle: null,
    description: 'Lightweight 5v5 MOBA for phones—quick matches, ranked play, evolving heroes, and team PvP.',
    image_path: '',
    link_url: 'https://play.google.com/store/apps/details?id=com.indiecode.masters&hl=en_IN',
    sort_order: 1
  },
  {
    tabSortIndex: 1,
    title: 'Wuthering Waves',
    subtitle: null,
    description:
      'Open-world action RPG—explore Solaris-3, fast combat with Resonators, and story-rich adventure (Kuro Games).',
    image_path: '',
    link_url: 'https://play.google.com/store/apps/details?id=com.kurogame.wutheringwaves.global&utm_source=na_Med',
    sort_order: 2
  },
  {
    tabSortIndex: 1,
    title: 'Hexa Stack: Color Sort Puzzle',
    subtitle: null,
    description:
      'Relaxing hex-tile puzzle—sort and merge colors through thousands of logic levels and seasonal challenges.',
    image_path: '',
    link_url: 'https://play.google.com/store/apps/details?id=de.softgames.hexastack&hl=en_US',
    sort_order: 3
  },
  {
    tabSortIndex: 1,
    title: 'Toy City: Block Building 3D',
    subtitle: null,
    description:
      'Idle 3D city builder—stack toy blocks, unlock workers, and grow a pocket metropolis at your own pace.',
    image_path: '',
    link_url: 'https://play.google.com/store/apps/details?id=toys.blocks.town.bricks&utm_source=na_Med',
    sort_order: 4
  },
  {
    tabSortIndex: 1,
    title: 'AR Ruler App: Tape Measure Cam',
    subtitle: null,
    description:
      'AR measuring toolkit—distance, angles, area, room plans, and export using your phone camera (ARCore).',
    image_path: '',
    link_url: 'https://play.google.com/store/apps/details?id=com.grymala.aruler&hl=en_US',
    sort_order: 5
  }
];

async function ensureCanonicalLeadership(pool, logPrefix = '[seed]') {
  let inserted = 0;
  for (const m of CANONICAL_LEADERSHIP) {
    const [ex] = await pool.query(
      'SELECT id FROM leadership_members WHERE name = ? AND role_title = ? LIMIT 1',
      [m.name, m.roleTitle]
    );
    if (ex.length) {
      continue;
    }
    await pool.query(
      `INSERT INTO leadership_members (name, role_title, blurb, badge_label, photo_path, card_aria, cta_label, cta_aria, cta_path, open_seat, sort_order, status)
       VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, 'published')`,
      [
        m.name,
        m.roleTitle,
        m.blurb,
        m.badgeLabel,
        m.cardAria,
        m.ctaLabel ?? null,
        m.ctaAria ?? null,
        m.ctaPath ?? null,
        m.openSeat,
        m.sortOrder
      ]
    );
    inserted += 1;
  }
  if (inserted) {
    console.log(`${logPrefix} Inserted ${inserted} missing canonical leadership row(s).`);
  }
}

/** Ensure default portfolio tabs exist; returns [firstTabId, secondTabId] by sort_order. */
async function ensureDefaultPortfolioTabs(pool) {
  const specs = [
    ['Web & Enterprise', 0],
    ['AI, Unity, AR/VR', 1]
  ];
  for (const [title, sortOrder] of specs) {
    const [ex] = await pool.query('SELECT id FROM portfolio_tabs WHERE title = ? LIMIT 1', [title]);
    if (ex.length) {
      continue;
    } else {
      await pool.query(`INSERT INTO portfolio_tabs (title, sort_order, status) VALUES (?, ?, 'published')`, [
        title,
        sortOrder
      ]);
    }
  }
  const [ordered] = await pool.query(
    `SELECT id FROM portfolio_tabs WHERE status = 'published' ORDER BY sort_order ASC, id ASC LIMIT 2`
  );
  return [ordered[0]?.id, ordered[1]?.id];
}

async function ensureCanonicalPortfolio(pool, logPrefix = '[seed]') {
  const [w, g] = await ensureDefaultPortfolioTabs(pool);
  if (!w || !g) {
    console.warn(`${logPrefix} Could not resolve two portfolio tabs; skip canonical items.`);
    return;
  }

  let inserted = 0;
  for (const it of CANONICAL_PORTFOLIO_ITEMS) {
    const tabId = it.tabSortIndex === 0 ? w : g;
    const [byTitle] = await pool.query('SELECT id FROM portfolio_items WHERE tab_id = ? AND title = ? LIMIT 1', [
      tabId,
      it.title
    ]);
    if (byTitle.length) continue;
    await pool.query(
      `INSERT INTO portfolio_items (tab_id, title, subtitle, description, image_path, link_url, sort_order, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'published')`,
      [tabId, it.title, it.subtitle, it.description, it.image_path, it.link_url, it.sort_order]
    );
    inserted += 1;
  }
  if (inserted) {
    console.log(`${logPrefix} Inserted ${inserted} missing canonical portfolio item(s).`);
  }
}

/**
 * @param {import('mysql2/promise').Pool} pool
 * @param {string} [logPrefix]
 */
async function seedCanonicalHomepageContent(pool, logPrefix = '[seed]') {
  await ensureCanonicalLeadership(pool, logPrefix);
  await ensureCanonicalPortfolio(pool, logPrefix);
}

module.exports = {
  seedCanonicalHomepageContent,
  CANONICAL_PORTFOLIO_ITEMS
};
