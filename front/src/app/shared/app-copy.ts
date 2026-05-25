/**
 * Single-language catalog of UI copy (dot-path keys resolved by TextService / `| t`).
 * Not a multilingual bundle — just structured strings for one locale.
 */
export const APP_TEXT = {
  skip: { main: 'Skip to main content' },
  layout: {
    mainAriaLabel: 'Main content',
    pageRegionAria: 'Page content'
  },
  nav: {
    primaryAria: 'Primary navigation',
    logoAlt: 'Zentrox — home',
    home: 'Home',
    about: 'About',
    leadership: 'Leadership',
    services: 'Services',
    portfolio: 'Portfolio',
    testimonials: 'Testimonials',
    contact: 'Contact',
    getQuote: 'Get a quote',
    openRoles: 'Open roles',
    getQuoteAria: 'Get a quote — opens quote request form in a new tab',
    openRolesAria: 'Open roles — view openings and apply in a new tab',
    toggleMenu: 'Toggle menu',
    mobileNav: 'Mobile'
  },
  footer: {
    tagline: 'SaaS & product engineering for ambitious U.S. markets',
    note: 'Partners and clients across the United States.',
    linksAria: 'Quick links',
    getQuote: 'Get a quote',
    openRoles: 'Open roles',
    contact: 'Contact',
    copy: '© 2026 Zentrox. All rights reserved.',
    linkedinAria: 'Zentrox on LinkedIn',
    slackAria: 'Slack'
  },
  hero: {
    carousel: 'Featured services',
    slide0: {
      alt: 'Product and engineering team collaborating on software delivery',
      title: 'SaaS & Platforms for Serious U.S. Markets.',
      text: 'We collaborate with idea owners and aligned investors—honest scopes, senior engineers, and releases you can plan around.',
      cta: 'Get a quote'
    },
    slide1: {
      alt: 'Modern glass office towers — enterprise web and digital platforms',
      title: 'Web & Enterprise-Grade Platforms.',
      text: 'Web apps, APIs, and integrations built to stay fast, observable, and maintainable at scale.',
      cta: 'Explore Services'
    },
    slide2: {
      alt: 'Soft abstract gradient — AI, real-time 3D, and immersive products',
      title: 'AI, Unity & AR/VR — Built for Production.',
      text: 'AI, Unity, and AR/VR tuned for real devices, performance, and uptime.',
      cta: 'Portfolio'
    }
  },
  about: {
    title: 'About Zentrox',
    lead:
      'partners with idea owners and aligned investors to ship quality SaaS for ambitious U.S. markets—proven web, API, AI, and Unity engineering, clear scopes, U.S. business hours—and a drive to become one of America’s top SaaS development teams.',
    story: {
      title: 'Our Story',
      body: 'We are product- and engineering-led, building SaaS meant to compete for serious market share—not one-off demos. We collaborate openly with founders who own the vision and investors who demand execution, so milestones map to revenue, retention, and products that can scale.'
    },
    mission: {
      title: 'Our Mission',
      body: 'We pursue ambitious roadmaps with partners targeting major opportunities: secure, maintainable SaaS on a steady cadence—plans we can stand behind, releases that move business metrics, and revenue from software built to win and retain customers in competitive categories.'
    },
    vision: {
      title: 'Our Vision',
      body: 'Be counted among America’s leading SaaS development teams—the partner that founders and investors choose when the market is large, the quality bar is high, and progress must show up in both the product and sustainable revenue.'
    }
  },
  leadership: {
    title: 'Leadership',
    lead: 'Leaders who ship SaaS with discipline—partnering with founders, investors, and delivery teams for the long run.',
    loading: 'Loading leadership…',
    loadError: 'Could not load leadership. Please try again later.',
    empty: 'No leadership profiles are published right now.'
  },
  services: {
    title: 'Services',
    intro:
      'Engineering for ambitious SaaS and web platforms—cloud & data, AI, 3D/Unity, and DevOps—with clear delivery and handoff.',
    model1: { title: 'Project delivery', body: 'Fixed scope, milestones, and demos when outcomes are well defined.' },
    model2: { title: 'Team extension', body: 'Engineers embedded with your team—shared tools and U.S. hours overlap.' },
    model3: { title: 'Advisory', body: 'Architecture and security-minded reviews before you commit to a build.' },
    web: {
      title: 'Web Development',
      body: 'Responsive, high-performance websites and web applications built with modern frameworks and best practices for accessibility, SEO, and maintainability.'
    },
    frontend: {
      title: 'Frontend Design',
      body: 'Clean, intuitive interfaces using component-driven design systems and modern UI tooling—focused on usability, consistency, and conversion.'
    },
    backend: {
      title: 'Backend & APIs',
      body: 'Secure backend services and APIs with strong architecture, observability, and performance—built to integrate cleanly across your systems.'
    },
    data: {
      title: 'Databases & Cloud',
      body: 'Data modeling, performance tuning, and cloud deployments across relational and NoSQL databases—supported by reliable CI/CD and infrastructure practices.'
    },
    qa: {
      title: 'Testing & QA',
      body: 'Automated testing and quality gates to prevent regressions and improve release confidence—from unit tests to end-to-end flows.'
    },
    ai: {
      title: 'AI & ML',
      body: 'Practical AI solutions that automate workflows, unlock insights, and enhance products—grounded in measurable business outcomes.'
    },
    game: {
      title: 'Game & 3D',
      body: 'Immersive Unity experiences, simulations, and interactive 3D applications for training, engagement, and next-gen product demos.'
    },
    devops: {
      title: 'DevOps & Management',
      body: 'Delivery pipelines and operational practices that improve reliability and speed—CI/CD, environments, monitoring, and release process support.'
    },
    custom: {
      title: 'Custom Solutions',
      body: 'Tailored software, enterprise integrations, and modernization work designed around your requirements, timelines, and internal constraints.'
    }
  },
  counters: {
    sectionAria: 'Company highlights',
    years: 'Years of Experience',
    projects: 'Completed Projects',
    clients: 'Clients Served',
    milestones: 'Go-live milestones'
  },
  portfolio: {
    title: 'Portfolio',
    intro:
      'Representative projects and technology focus areas across Web & Enterprise, AI, Unity, and AR/VR.',
    loading: 'Loading portfolio…',
    loadError: 'Could not load portfolio. Please try again later.',
    empty: 'No portfolio items are published right now.',
    filterToolbarAria: 'Filter portfolio by category',
    filterAll: 'All',
    preview: 'Preview',
    details: 'More Details',
    openProject: 'Open project',
    openProjectAria: 'Open project in a new tab',
    close: 'Close',
    modalPreviewSubtitle: 'Project preview',
    modalNoLink: 'No external link'
  },
  testimonials: {
    title: 'Testimonials',
    t0: {
      role: 'CEO',
      location: 'Ashland, OR, US',
      quote:
        'Video and on-demand content put a lot of stress on UX and performance. Zentrox worked with us to stabilize key paths, improve clarity across long sessions, and support launches without our team fighting fires every week.'
    },
    t1: {
      role: 'CEO',
      location: 'United States',
      quote:
        'We needed a partner who could ship consumer-grade flows for artists and fans—accounts, storefronts, and growth surfaces—while keeping the stack maintainable. The team communicated clearly and delivered with the reliability our marketplace depends on.'
    },
    t2: {
      role: 'Co-Founder & CEO',
      location: 'Lakewood, CO, US',
      quote:
        'Zentrox helped us tighten our web experience around a complex health journey—clear information architecture, solid performance, and engineering that could iterate with our product roadmap without slowing releases.'
    }
  },
  contact: {
    title: 'Contact',
    lead1: 'Reach Zentrox by email or phone.',
    lead2: 'We read every request and respond during Central Time business hours.',
    chipsAria: 'Response and hours',
    formTitle: 'Send a message',
    name: 'Name',
    email: 'Email',
    subject: 'Subject',
    message: 'Message',
    submit: 'Send message',
    sending: 'Sending…',
    asideAria: 'Office location and contact details',
    mapAlt: 'Map of Austin, Texas and surrounding area',
    formSubject: 'New website message (Zentrox)',
    success: 'Thanks — your message was sent.',
    error: 'Sorry — something went wrong. Please email us directly.',
    hours: 'Mon–Fri · 9:00 a.m. – 6:00 p.m. CT',
    sla: 'We reply within one business day.'
  },
  backTop: { aria: 'Back to top' },
  openRoles: {
    title: 'Open roles',
    intro: 'Browse current openings at Zentrox and apply online in a few minutes.',
    loading: 'Loading openings…',
    loadError: 'Could not load open roles. Please try again later.',
    empty: 'No open positions right now. Check back soon.',
    applyCta: 'Apply'
  },
  openRoleApply: {
    formRegionAria: 'Open role application form',
    subtitle: 'Application for this role',
    loading: 'Loading role…',
    loadError: 'This open role is not available or could not be loaded.',
    backOpenRoles: 'Back to open roles',
    fullName: 'Full name',
    email: 'Email',
    phone: 'Phone (optional)',
    cover: 'Cover letter (optional)',
    resumeUrl: 'Résumé link (optional)',
    resumeUrlInvalid: 'Enter a full URL starting with https:// or http://',
    resumeUrlScheme: 'Résumé link must use http or https.',
    required: 'This field is required.',
    fullNameMinLength: 'Enter at least 2 characters.',
    emailInvalid: 'Enter a valid email address.',
    submit: 'Submit application',
    sending: 'Sending…',
    submitError: 'Something went wrong. Please try again or email us directly.',
    cancel: 'Cancel',
    thanksTitle: 'Application received',
    thanksBody: 'Thank you. We will review your application and reply if there is a fit.'
  },
  getQuote: {
    title: 'Get a quote',
    intro:
      'Tell us what you need and your budget range. We review every quote request and reply within one business day.',
    requiredFieldsNote: 'Fields marked with * are required. All other fields are optional.',
    formRegionAria: 'Get a quote form',
    submit: 'Submit request',
    sending: 'Sending…',
    submitError: 'Something went wrong. Please try again or email us directly.',
    submitValidationError: 'Please check the highlighted fields and try again.',
    submitRateLimit: 'Too many submissions. Please wait a few minutes and try again.',
    submitUnavailable:
      'Our server is temporarily unavailable. Please try again in a few minutes or email us directly.',
    thanksTitle: 'Quote request received',
    thanksBody: 'Thank you. We will review your project details and get back to you soon.',
    dismissNotice: 'Dismiss notification',
    fullName: 'Full name',
    email: 'Email',
    company: 'Company',
    phone: 'Phone',
    serviceType: 'Service',
    requirements: 'Project requirements',
    requirementsHint: 'Describe goals, features, integrations, and anything else we should know.',
    budgetRange: 'Budget range',
    timeline: 'Timeline',
    optionalMark: '(optional)',
    requiredMark: '*',
    requiredSrOnly: '(required)',
    selectService: 'Select a service',
    selectBudget: 'Select a budget range',
    selectTimeline: 'No preference',
    required: 'This field is required.',
    emailInvalid: 'Enter a valid email address.',
    service: {
      web: 'Web development',
      frontend: 'Frontend design',
      backend: 'Backend & APIs',
      data: 'Databases & cloud',
      qa: 'Testing & QA',
      ai: 'AI & ML',
      game: 'Game & 3D',
      devops: 'DevOps & management',
      custom: 'Custom solutions',
      not_sure: 'Not sure yet'
    },
    budget: {
      under_10k: 'Under $10,000',
      '10k_50k': '$10,000 – $50,000',
      '50k_100k': '$50,000 – $100,000',
      over_100k: 'Over $100,000',
      not_sure: 'Not sure yet'
    },
    timelineOption: {
      asap: 'ASAP',
      '1_3_months': '1–3 months',
      '3_6_months': '3–6 months',
      '6_plus_months': '6+ months',
      flexible: 'Flexible'
    },
    status: {
      new: 'New',
      contacted: 'Contacted',
      qualified: 'Qualified',
      won: 'Won',
      lost: 'Lost'
    }
  },
  admin: {
    loginTitle: 'Admin — sign in',
    loginLuckyDay: 'Lucky day!',
    loginLuckyHint: 'Fortune favors the bold admin.',
    loginUsername: 'Username',
    loginPassword: 'Password',
    sideNavAria: 'Admin sections',
    loginSubmit: 'Sign in',
    loginError: 'Sign-in failed. Check your username and password.',
    navLeadership: 'Leadership',
    navPortfolio: 'Portfolio',
    navQuotes: 'Quotes',
    navOpenRoles: 'Open roles',
    navApplications: 'Applications',
    navAccount: 'Account',
    logout: 'Sign out',
    modalClose: 'Close dialog',
    tableCaptionOpenRoles: 'Open roles',
    tableCaptionLeadership: 'Leadership members',
    tableCaptionPortfolioTabs: 'Portfolio tabs',
    tableCaptionPortfolioItems: 'Portfolio items',
    tableCaptionApplications: 'Open role applications',
    tableCaptionQuotes: 'Quotes',
    applicationDeleteError: 'Could not delete that application. Try again.',
    quotesDeleteError: 'Could not delete that quote request. Try again.',
    deleteConfirmTypeDelete: 'Type delete to confirm.',
    deleteConfirmPlaceholder: 'delete',
    deleteConfirmNote: 'This step helps prevent accidental deletion.',
    linkOpensNewTab: 'Opens in a new tab',
    openRolesTitle: 'Open roles',
    openRolesIntro: 'Create drafts, publish openings, or remove listings. Published roles appear on the public open roles page.',
    openRolesLoadError: 'Could not load open roles.',
    openRolesSaveError: 'Could not save role. Check your connection and try again.',
    formValidationHint:
      'Required fields are missing or invalid — fix them below, then try saving again.',
    roleDescriptionToolbarAria: 'Description formatting tools',
    editorStructureGroupAria: 'Structure',
    editorInlineGroupAria: 'Inline and lists',
    editorParagraph: 'Paragraph',
    editorHeading: 'Heading',
    editorSubheading: 'Subheading',
    editorBold: 'Bold',
    editorItalic: 'Italic',
    editorBullets: 'Bullets',
    editorNumbered: 'Numbered',
    editorLink: 'Link',
    colTitle: 'Title',
    colLocation: 'Location',
    colType: 'Type',
    colStatus: 'Status',
    colActions: 'Actions',
    statusDraft: 'Draft',
    statusPublished: 'Published',
    formNewTitle: 'New role',
    formEditTitle: 'Edit role',
    fieldTitle: 'Title',
    fieldName: 'Name',
    fieldDescription: 'Description',
    fieldLocation: 'Location',
    fieldEmploymentType: 'Employment type',
    fieldStatus: 'Status',
    saveCreate: 'Create role',
    saveUpdate: 'Save changes',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    applicationsTitle: 'Applications',
    applicationsIntro: 'Submissions from the open roles page, newest first.',
    applicationsLoadError: 'Could not load applications.',
    applicationsEmpty: 'No applications yet.',
    quotesTitle: 'Quote requests',
    quotesIntro: 'Submissions from the public get a quote page, newest first.',
    quotesLoadError: 'Could not load quote requests.',
    quotesLoading: 'Loading quote requests…',
    quotesRefresh: 'Refresh',
    quotesEmpty: 'No quote requests yet.',
    quotesDetailTitle: 'Quote details',
    quotesNotes: 'Internal notes',
    viewQuote: 'View',
    colClient: 'Client',
    colEmail: 'Email',
    colPhone: 'Phone',
    colResumeUrl: 'Résumé link',
    colApplicant: 'Applicant',
    colRole: 'Role',
    colReceived: 'Received',
    viewApplicant: 'View',
    applicationDetailTitle: 'Application details',
    applicationDetailClose: 'Close',
    viewCover: 'Cover letter',
    leadershipTitle: 'Manage leadership',
    dragReorder: 'Drag to reorder',
    leadershipIntro:
      'Published profiles appear on the home page. Set name, role, and description; add `front/img/leadership/leadership-{id}.png` for each row’s photo.',
    leadershipLoadError: 'Could not load leadership members.',
    leadershipCreate: 'Create member',
    leadershipFormNew: 'New leadership member',
    leadershipFormEdit: 'Edit leadership member',
    leadershipSaveError: 'Could not save. Check the form and try again.',
    leadershipColPhoto: 'Photo',
    leadershipPhotoLabel: 'Photo',
    leadershipPhotoHint:
      'Photos are static files at `front/img/leadership/leadership-{id}.png` on disk (matching each row ID). Missing files fall back to `/img/leadership/placeholder-avatar.svg`.',
    leadershipPhotoClear: 'Remove photo',
    leadershipPhotoUploading: 'Uploading…',
    leadershipPhotoUploadError: 'Upload failed. Check file type and size, then try again.',
    fieldRoleTitle: 'Role title',
    portfolioTitle: 'Manage portfolio',
    portfolioIntro: 'Tabs drive filter buttons on the home page; items appear under each tab.',
    portfolioLoadError: 'Could not load portfolio data.',
    portfolioTabsHeading: 'Tabs',
    portfolioItemsHeading: 'Items',
    portfolioItemsNeedTab: 'Create a tab before adding items.',
    portfolioFirstTabCreated: 'First tab saved. You can add portfolio items now.',
    portfolioNoItemsInTab: 'No items in this tab yet.',
    portfolioCreateTab: 'New tab',
    portfolioCreateItem: 'New item',
    portfolioTabFormNew: 'New portfolio tab',
    portfolioTabFormEdit: 'Edit portfolio tab',
    portfolioItemFormNew: 'New portfolio item',
    portfolioItemFormEdit: 'Edit portfolio item',
    portfolioTabSaveError: 'Could not save tab.',
    portfolioItemSaveError: 'Could not save item.',
    portfolioImageHint:
      'Upload a JPEG, PNG, WebP, or GIF (up to 15 MB before processing). Published items use fixed files at `/img/portfolio/portfolio-{itemId}.png` in your `front/img` assets.',
    portfolioImageClear: 'Remove image',
    portfolioImageUploading: 'Uploading…',
    portfolioImageUploadError: 'Upload failed. Check file type and size, then try again.',
    portfolioImageFileInputLabel: 'Upload or replace cover image',
    fieldTab: 'Tab',
    fieldSubtitle: 'Subtitle',
    portfolioImageSectionLabel: 'Image',
    portfolioCoverImageItemIdLabel: 'Item ID',
    portfolioCoverImageIdPending: 'Save this item once to receive an ID.',
    portfolioCoverImagePathLabel: 'Public file path',
    fieldLinkUrl: 'Link URL',
    noticeSaved: 'Saved successfully.',
    noticeDeleted: 'Deleted successfully.',
    noticeReordered: 'Order updated.',
    noticeStatusUpdated: 'Status updated.',
    noticeImageUploaded: 'Image uploaded.',
    noticeSaveFailed: 'Could not save. Please try again.',
    noticeDeleteFailed: 'Could not delete. Please try again.',
    noticeReorderFailed: 'Could not update order. Please try again.',
    noticeStatusFailed: 'Could not update status. Please try again.',
    noticeUploadFailed: 'Could not upload image. Please try again.',
    accountTitle: 'Account settings',
    accountIntro: 'Change your admin username or password. Your current password is required to save any changes.',
    accountLoading: 'Loading account…',
    accountRetry: 'Try again',
    accountLoadError: 'Could not load account details.',
    accountChangesHint: 'Optional: set a new username and/or password below.',
    accountCurrentPasswordRequired: 'Enter your current password to save changes.',
    accountCurrentUsername: 'Current username',
    accountNewUsername: 'New username',
    accountNewUsernameHint: 'Leave blank to keep your current username.',
    accountCurrentPassword: 'Current password',
    accountNewPassword: 'New password',
    accountNewPasswordHint: 'Leave blank to keep your current password.',
    accountConfirmPassword: 'Confirm new password',
    accountSave: 'Save changes',
    accountSaved: 'Account updated successfully.',
    accountSaveError: 'Could not update account. Please try again.',
    accountCurrentPasswordInvalid: 'Current password is incorrect.',
    accountSaving: 'Saving…',
    accountUsernameTaken: 'That username is already in use.',
    accountPasswordMismatch: 'New password and confirmation do not match.',
    accountPasswordTooShort: 'New password must be at least 8 characters.',
    accountNothingToChange: 'Enter a new username and/or password to save.',
    accountUsernameInvalid: 'Username must be 3–128 characters (letters, numbers, dots, hyphens, underscores).',
    none: '—'
  },
  seo: {
    homeTitle: 'Zentrox — U.S. SaaS & Product Engineering',
    homeDescription:
      'SaaS and web platform engineering for ambitious U.S. markets—partnerships with idea owners and investors. Web, APIs, AI, cloud, and Unity. Zentrox, Austin, TX. Clear scopes, documentation, and U.S. business hours.',
    homeKeywords:
      'Zentrox, SaaS development USA, US product engineering, Austin software company, enterprise SaaS USA, US technology partner, web platform development United States, API development USA, DevOps USA, AI consulting USA, Unity development USA, U.S. startup engineering partner, custom SaaS development Austin',
    openRolesTitle: 'Open roles — Zentrox',
    openRolesDescription:
      'Open engineering and product delivery roles at Zentrox—SaaS, web platforms, APIs, and AI—with U.S. business-hours overlap. Remote-friendly contract work; apply online in minutes. Austin, TX–based team.',
    openRolesKeywords:
      'Zentrox careers, Zentrox jobs, software engineer jobs Austin, remote SaaS engineer contract, full stack Angular Node jobs, product engineering careers USA, Upwork partnership engineer, API developer remote US, AI engineer contract, Austin Texas software jobs',
    ogImageAlt: 'Zentrox — hero image for SaaS and product engineering',
    jsonLdOrgDescription:
      'U.S. SaaS and product engineering partner—collaboration with idea owners and investors, enterprise web, APIs, AI, cloud, DevOps, and Unity.',
    jsonLdWebPageDescription:
      'SaaS and web platform engineering for ambitious U.S. markets — partnerships with founders and investors; web, APIs, AI, cloud, and Unity.',
    jsonLdOpenRolesWebPageDescription:
      'Open roles at Zentrox—browse published engineering and delivery roles, remote contract work with U.S. overlap, and online applications.',
    jsonLdOpenRolesBreadcrumbHome: 'Home',
    jsonLdOpenRolesBreadcrumbOpenRoles: 'Open roles',
    openRoleApplyTitle: 'Apply — Zentrox',
    openRoleApplyDescription:
      'Submit your application for an open role at Zentrox. Short form; we reply when there is a fit.',
    openRoleApplyKeywords:
      'apply to Zentrox, software engineer application, open role application, remote engineering application',
    getQuoteTitle: 'Get a quote — Zentrox',
    getQuoteDescription:
      'Request a project quote from Zentrox. Share your requirements, service needs, and budget range. We reply within one business day.',
    getQuoteKeywords:
      'Zentrox project quote, hire software developers, SaaS development quote, web development budget, Austin software agency'
  }
} as const;
