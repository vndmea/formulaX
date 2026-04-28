import { legacyCommonUtils } from './legacy-common';
import { legacyEventListener } from './legacy-event';

export const legacyBaseUtils = legacyCommonUtils.extend({}, legacyCommonUtils, legacyEventListener);
