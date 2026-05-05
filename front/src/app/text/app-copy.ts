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
    about: 'About Us',
    services: 'Our Services',
    portfolio: 'Our Portfolio',
    clients: 'Clients',
    contact: 'Contact Us',
    careers: 'Careers',
    toggleMenu: 'Toggle menu',
    mobileNav: 'Mobile'
  },
  footer: {
    tagline: 'SaaS & product engineering for ambitious U.S. markets',
    note: 'Partners and clients across the United States.',
    copy: '© 2026 Zentrox. All rights reserved.',
    linkedin: 'LinkedIn',
    linkedinAria: 'Zentrox on LinkedIn',
    slack: 'Slack',
    slackAria: 'Slack'
  },
  hero: {
    carousel: 'Featured services',
    slide0: {
      alt: 'Product and engineering team collaborating on software delivery',
      title: 'SaaS & Platforms for Serious U.S. Markets.',
      text: 'We collaborate with idea owners and aligned investors—honest scopes, senior engineers, and releases you can plan around.',
      cta: "Let's Talk"
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
      cta: 'View Work'
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
    title: 'What We Offer',
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
    title: 'Our Portfolio',
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
  clients: {
    title: 'What clients say',
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
    title: 'Get in touch',
    lead1: 'Reach Zentrox by email or phone.',
    lead2: 'We read every inquiry and respond during Central Time business hours.',
    chipsAria: 'Response and hours',
    formTitle: 'Send a message',
    name: 'Name',
    email: 'Work email',
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
  mvp: {
    cta: {
      sectionAria: 'MVP pipeline call to action',
      title: 'Our MVP pipeline',
      body: 'We build SaaS MVPs with focused scope, clear milestones, and launch-ready outcomes.',
      linkLabel: 'View MVP',
      linkAria: 'View SaaS MVP initiatives in progress (opens in a new tab)',
      loadingLabel: 'Loading…',
      loadingAria: 'Checking whether MVP listings are available',
      disabledLinkLabel: 'View MVP',
      disabledLinkAria: 'No published MVPs are listed yet; link is unavailable'
    },
    page: {
      heading: 'SaaS MVPs in progress',
      gridAria: 'MVP initiatives as cards',
      loading: 'Loading MVP list…',
      empty: 'No MVPs are listed right now.',
      loadError: 'Could not load the MVP list. Please try again later.',
      statusRegionAria: 'MVP list status'
    }
  },
  careers: {
    title: 'Careers',
    intro: 'Open roles at Zentrox. Apply online in a few minutes.',
    loading: 'Loading openings…',
    loadError: 'Could not load job listings. Please try again later.',
    empty: 'No open positions right now. Check back soon.',
    applyCta: 'Apply'
  },
  apply: {
    formRegionAria: 'Job application form',
    subtitle: 'Application for this role',
    loading: 'Loading job…',
    loadError: 'This job is not available or could not be loaded.',
    backCareers: 'Back to careers',
    fullName: 'Full name',
    email: 'Email',
    phone: 'Phone (optional)',
    cover: 'Cover letter (optional)',
    resumeUrl: 'Résumé link (optional)',
    resumeUrlInvalid: 'Enter a full URL starting with https:// or http://',
    resumeUrlScheme: 'Résumé link must use http or https.',
    required: 'This field is required.',
    emailInvalid: 'Enter a valid email address.',
    submit: 'Submit application',
    sending: 'Sending…',
    submitError: 'Something went wrong. Please try again or email us directly.',
    cancel: 'Cancel',
    thanksTitle: 'Application received',
    thanksBody: 'Thank you. We will review your application and reply if there is a fit.'
  },
  admin: {
    loginTitle: 'Admin — sign in',
    loginUsername: 'Username',
    loginPassword: 'Password',
    sideNavAria: 'Admin sections',
    loginSubmit: 'Sign in',
    loginError: 'Sign-in failed. Check your username and password.',
    navLeadership: 'Leadership',
    navMvp: 'MVP items',
    navPortfolio: 'Portfolio',
    navJobs: 'Job postings',
    navApplications: 'Applications',
    logout: 'Sign out',
    modalClose: 'Close dialog',
    tableCaptionJobs: 'Job postings',
    tableCaptionMvp: 'MVP items',
    tableCaptionLeadership: 'Leadership members',
    tableCaptionPortfolioTabs: 'Portfolio tabs',
    tableCaptionPortfolioItems: 'Portfolio items',
    tableCaptionApplications: 'Job applications',
    applicationDeleteError: 'Could not delete that application. Try again.',
    linkOpensNewTab: 'Opens in a new tab',
    jobsTitle: 'Manage job postings',
    jobsIntro: 'Create drafts, publish openings, or remove listings. Published jobs appear on the public careers page.',
    jobsLoadError: 'Could not load jobs.',
    jobsSaveError: 'Could not save job. Check your connection and try again.',
    formValidationHint:
      'Required fields are missing or invalid — fix them below, then try saving again.',
    jobDescriptionToolbarAria: 'Description formatting tools',
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
    formNewTitle: 'New job',
    formEditTitle: 'Edit job',
    fieldTitle: 'Title',
    fieldName: 'Name',
    fieldDescription: 'Description',
    fieldLocation: 'Location',
    fieldEmploymentType: 'Employment type',
    fieldStatus: 'Status',
    saveCreate: 'Create job',
    saveUpdate: 'Save changes',
    cancel: 'Cancel',
    cancelEdit: 'Cancel edit',
    edit: 'Edit',
    delete: 'Delete',
    deleteConfirm: 'Delete this job and all of its applications?',
    applicationDeleteConfirm: 'Delete this application? This cannot be undone.',
    mvpDeleteConfirm: 'Delete this MVP item? It will disappear from the public MVP page if it was published.',
    applicationsTitle: 'Applications',
    applicationsIntro: 'Submissions from the careers page, newest first.',
    applicationsLoadError: 'Could not load applications.',
    colApplicant: 'Applicant',
    colJob: 'Job',
    colReceived: 'Received',
    viewApplicant: 'View',
    applicationDetailTitle: 'Application details',
    applicationDetailClose: 'Close',
    viewCover: 'Cover letter',
    mvpTitle: 'Manage MVP items',
    mvpIntro: 'Control the public MVP placeholder cards shown on /mvp.',
    mvpLoadError: 'Could not load MVP items.',
    mvpCreate: 'Create MVP item',
    mvpFormNew: 'New MVP item',
    mvpFormEdit: 'Edit MVP item',
    mvpStage: 'Stage',
    dragReorder: 'Drag to reorder',
    mvpStageInvalid: 'Choose a valid stage from the list.',
    mvpSaveError: 'Could not save. Check the form and try again.',
    leadershipTitle: 'Manage leadership',
    leadershipIntro:
      'Published profiles appear on the home page. Set name, role, and description; add `front/img/leadership/leadership-{id}.png` for each row’s photo.',
    leadershipLoadError: 'Could not load leadership members.',
    leadershipCreate: 'Create member',
    leadershipFormNew: 'New leadership member',
    leadershipFormEdit: 'Edit leadership member',
    leadershipSaveError: 'Could not save. Check the form and try again.',
    leadershipDeleteConfirm: 'Delete this leadership member?',
    leadershipColPhoto: 'Photo',
    leadershipPhotoLabel: 'Photo',
    leadershipPhotoHint:
      'JPEG, PNG, WebP, or GIF — up to 15 MB before processing. Saved as 762×1016 JPEG under /img/upload/leadership/ with a Unix-time filename (seconds).',
    leadershipPhotoClear: 'Remove photo',
    leadershipPhotoUploading: 'Uploading…',
    leadershipPhotoUploadError: 'Upload failed. Check file type and size, then try again.',
    fieldRoleTitle: 'Role title',
    fieldBlurb: 'Bio / blurb',
    fieldBadgeLabel: 'Badge label (open seat)',
    fieldPhotoPath: 'Photo path',
    fieldCardAria: 'Card ARIA label',
    fieldCtaLabel: 'CTA label (linked card)',
    fieldCtaAria: 'CTA ARIA label',
    fieldCtaPath: 'In-app link path',
    fieldOpenSeat: 'Open seat (placeholder card)',
    portfolioTitle: 'Manage portfolio',
    portfolioIntro: 'Tabs drive filter buttons on the home page; items appear under each tab.',
    portfolioLoadError: 'Could not load portfolio data.',
    portfolioTabsHeading: 'Tabs',
    portfolioItemsHeading: 'Items',
    portfolioItemsNeedTab: 'Create a tab before adding items.',
    portfolioNoItemsInTab: 'No items in this tab yet.',
    portfolioCreateTab: 'New tab',
    portfolioCreateItem: 'New item',
    portfolioTabFormNew: 'New portfolio tab',
    portfolioTabFormEdit: 'Edit portfolio tab',
    portfolioItemFormNew: 'New portfolio item',
    portfolioItemFormEdit: 'Edit portfolio item',
    portfolioTabSaveError: 'Could not save tab.',
    portfolioTabDeleteConfirm: 'Delete this tab? All items in this tab will be removed.',
    portfolioItemSaveError: 'Could not save item.',
    portfolioImageHint:
      'Upload a JPEG, PNG, WebP, or GIF (up to 15 MB before processing). Published items use fixed files at `/img/portfolio/portfolio-{itemId}.png` in your `front/img` assets.',
    portfolioImageClear: 'Remove image',
    portfolioImageUploading: 'Uploading…',
    portfolioImageUploadError: 'Upload failed. Check file type and size, then try again.',
    portfolioImageFileInputLabel: 'Upload or replace cover image',
    portfolioItemDeleteConfirm: 'Delete this portfolio item?',
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
    none: '—'
  },
  seo: {
    homeTitle: 'Zentrox — U.S. SaaS & Product Engineering',
    homeDescription:
      'SaaS and web platform engineering for ambitious U.S. markets—partnerships with idea owners and investors. Web, APIs, AI, cloud, and Unity. Zentrox, Austin, TX. Clear scopes, documentation, and U.S. business hours.',
    homeKeywords:
      'Zentrox, SaaS development USA, US product engineering, Austin software company, enterprise SaaS USA, US technology partner, web platform development United States, API development USA, DevOps USA, AI consulting USA, Unity development USA, U.S. startup engineering partner, custom SaaS development Austin',
    careersTitle: 'Careers — Zentrox',
    careersDescription:
      'Open engineering and product delivery roles at Zentrox—SaaS, web platforms, APIs, and AI—with U.S. business-hours overlap. Remote-friendly contract work; apply online in minutes. Austin, TX–based team.',
    careersKeywords:
      'Zentrox careers, Zentrox jobs, software engineer jobs Austin, remote SaaS engineer contract, full stack Angular Node jobs, product engineering careers USA, Upwork partnership engineer, API developer remote US, AI engineer contract, Austin Texas software jobs',
    ogImageAlt: 'Zentrox — hero image for SaaS and product engineering',
    jsonLdOrgDescription:
      'U.S. SaaS and product engineering partner—collaboration with idea owners and investors, enterprise web, APIs, AI, cloud, DevOps, and Unity.',
    jsonLdWebPageDescription:
      'SaaS and web platform engineering for ambitious U.S. markets — partnerships with founders and investors; web, APIs, AI, cloud, and Unity.',
    mvpTitle: 'MVPs in progress',
    mvpDescription: 'Explore the SaaS MVP products currently being built by Zentrox.',
    mvpKeywords:
      'Zentrox, SaaS MVP, minimum viable product, software development, product engineering, Austin Texas',
    jsonLdMvpWebPageDescription:
      'Current SaaS MVP initiatives in discovery, prototyping, integration, and pilot stages at Zentrox.',
    jsonLdCareersWebPageDescription:
      'Careers at Zentrox—browse published engineering and delivery roles, remote contract work with U.S. overlap, and online applications.',
    jsonLdCareersBreadcrumbHome: 'Home',
    jsonLdCareersBreadcrumbCareers: 'Careers',
    jobApplyTitle: 'Apply — Zentrox',
    jobApplyDescription:
      'Submit your application for an open role at Zentrox. Short form; we reply when there is a fit.',
    jobApplyKeywords:
      'apply to Zentrox, software engineer application, developer job application, remote engineering application'
  }
} as const;
