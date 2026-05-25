const { createUserHealthRouter } = require('./user/health');
const { createUserOpenRolesRouter } = require('./user/open-roles');
const { createUserQuotesRouter } = require('./user/quotes');
const { createUserLeadershipRouter } = require('./user/leadership');
const { createUserPortfolioRouter } = require('./user/portfolio');
const { createAdminAuthRouter } = require('./admin/auth');
const { createAdminAccountRouter } = require('./admin/account');
const { createAdminOpenRolesRouter } = require('./admin/open-roles');
const { createAdminApplicationsRouter } = require('./admin/applications');
const { createAdminQuotesRouter } = require('./admin/quotes');
const { createAdminLeadershipRouter } = require('./admin/leadership');
const { createAdminPortfolioRouter } = require('./admin/portfolio');

function registerRoutes(app, deps) {
  const routers = [
    createUserHealthRouter(deps),
    createUserOpenRolesRouter(deps),
    createUserQuotesRouter(deps),
    createUserLeadershipRouter(deps),
    createUserPortfolioRouter(deps),
    createAdminAuthRouter(deps),
    createAdminAccountRouter(deps),
    createAdminOpenRolesRouter(deps),
    createAdminApplicationsRouter(deps),
    createAdminQuotesRouter(deps),
    createAdminLeadershipRouter(deps),
    createAdminPortfolioRouter(deps)
  ];

  for (const router of routers) {
    app.use('/api', router);
  }
}

module.exports = { registerRoutes };
