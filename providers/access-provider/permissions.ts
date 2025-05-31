import { newModel, StringAdapter } from "casbin";

export const model = newModel(`
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act  

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
  m = g(r.sub, p.sub) && keyMatch(r.obj, p.obj) && regexMatch(r.act, p.act)

`);

export const adapter = new StringAdapter(`
//Roles

g, pilot, guest
g, staff, pilot
g, admin, staff
g, CEO, admin

//Policies  

p, guest, home, (list)|(show)
p, guest, atis, (list)|(show)
p, guest, notams, (list)|(show)
p, guest, info, (list)|(show)
p, guest, alerts, (show)
p, guest, blog, (list)|(show)
p, guest, handbook, (list)|(show)
p, guest, rules, (list)|(show)
p, guest, lights, (list)|(show)
p, guest, contact, (list)|(show)

p, pilot, alerts, (show)
p, pilot, priornotice, (list)|(show)|(create)
p, pilot, priornotice/*, (edit)|(delete) 
p, pilot, fuel, (list)|(show)|(create)
p, pilot, webcam, (list)|(show)
p, pilot, flyk, (list)|(show)
p, pilot, weather, (list)|(show)
p, pilot, profile, (list)|(show)
p, pilot, profile/*, edit
p, pilot, sms, (list)|(show)|(create)
p, pilot, calendar, (list)|(show)



p, admin, users/*, (edit)|(delete)
p, admin, users, (create)
p, admin, fuelings/*, (edit)|(delete)
p, admin, fuelings, (create)
p, admin, flights/*, (edit)|(delete)
p, admin, flights, (create)
p, admin, blog, (create)
p, admin, blog/*, (edit)|(delete)
p, admin, sms/*, (edit)|(delete)
p, admin, alerts, (create)
p, admin, alerts/*, (edit)|(delete)
p, admin, admin, (list)|(show)
p, admin, calendar, (create)
p, admin, calendar/*, (edit)|(delete)
p, admin, fees, (list)|(show)


//eko
p, admin, dash, list
p, admin, todolist, (list)|(show)
p, admin, todolist/*, (edit)|(delete)|(show)
p, admin, notes, (list)|(show)
p, admin, notes/*, (edit)|(delete)|(show)
p, admin, crm_dropdown, (list)|(show)
p, admin, crm, (list)|(show)
p, admin, clients, (list)|(show)
p, admin, contacts, (list)|(show)
p, admin, prospects, (list)|(create)
p, admin, prospects/*, (edit)|(delete)|(show)
p, admin, deals, (list)|(show)
p, admin, calendar, (list)|(show)
p, admin, ledeger, (list)|(show)
p, admin, profiles, (list)|(show)
p, admin, profiles/*, (edit)
p, admin, resources_drop, (list)|(show)
p, admin, resources, (list)|(show)
p, admin, projectstart, (list)|(show)
p, admin, reports, (list)|(show)
p, admin, blogs, (list)|(show)
p, admin, chat, (list)|(show)

`);


