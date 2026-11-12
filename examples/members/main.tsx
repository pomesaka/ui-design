import { mountExample, params } from "../mount";
import { readScenario } from "./data";
import { MembersPage } from "./members-page";

mountExample(<MembersPage scenario={readScenario(params.toString())} />);
