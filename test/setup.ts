import { GlobalRegistrator } from "@happy-dom/global-registrator";

// Component tests render into a DOM; script tests do not need it but are unaffected.
GlobalRegistrator.register();
