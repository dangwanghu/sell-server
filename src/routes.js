'use strict';

import UserRoutes from './user/routes.user';
import ConfigRoutes from './config/routes.config';
import OrderRoutes from './order/routes.order';
import WithdrawRoutes from './withdraw/routes.withdraw';

let routes = [];

export default routes.concat(UserRoutes).concat(ConfigRoutes).concat(OrderRoutes).concat(WithdrawRoutes);

