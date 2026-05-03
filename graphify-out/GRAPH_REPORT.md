# Graph Report - Nexus  (2026-05-03)

## Corpus Check
- 42 files · ~10,101 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 116 nodes · 167 edges · 7 communities detected
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.67)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]

## God Nodes (most connected - your core abstractions)
1. `UserOut` - 8 edges
2. `cn()` - 8 edges
3. `useAuth()` - 6 edges
4. `Base` - 5 edges
5. `login()` - 5 edges
6. `Project` - 4 edges
7. `Task` - 4 edges
8. `User` - 4 edges
9. `signup()` - 4 edges
10. `ProjectOut` - 4 edges

## Surprising Connections (you probably didn't know these)
- `login()` --calls--> `verify_password()`  [INFERRED]
  backend\app\routers\auth.py → backend\app\core\security.py
- `signup()` --calls--> `User`  [INFERRED]
  backend\app\routers\auth.py → backend\app\models\user.py
- `ProtectedRoute()` --calls--> `useAuth()`  [INFERRED]
  frontend\src\App.tsx → frontend\src\context\AuthContext.tsx
- `get_current_user()` --calls--> `decode_token()`  [INFERRED]
  backend\app\core\dependencies.py → backend\app\core\security.py
- `signup()` --calls--> `hash_password()`  [INFERRED]
  backend\app\routers\auth.py → backend\app\core\security.py

## Communities

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (8): Base, DeclarativeBase, Base, Project, Task, User, create_project(), create_task()

### Community 1 - "Community 1"
Cohesion: 0.19
Nodes (17): BaseModel, Config, LoginRequest, SignupRequest, TokenResponse, UserOut, AddMemberRequest, MemberOut (+9 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (3): cn(), Badge(), Tabs()

### Community 3 - "Community 3"
Cohesion: 0.16
Nodes (9): BaseSettings, Settings, get_current_user(), create_access_token(), decode_token(), hash_password(), verify_password(), login() (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.18
Nodes (5): handleSubmit(), handleSubmit(), useAuth(), ProtectedRoute(), Label()

### Community 5 - "Community 5"
Cohesion: 0.4
Nodes (4): Run migrations in 'offline' mode.      This configures the context with just a U, Run migrations in 'online' mode.      In this scenario we need to create an Engi, run_migrations_offline(), run_migrations_online()

### Community 6 - "Community 6"
Cohesion: 0.5
Nodes (1): initial  Revision ID: 42e0b4fc5555 Revises:  Create Date: 2026-05-03 15:25:05.24

## Knowledge Gaps
- **4 isolated node(s):** `Run migrations in 'offline' mode.      This configures the context with just a U`, `Run migrations in 'online' mode.      In this scenario we need to create an Engi`, `initial  Revision ID: 42e0b4fc5555 Revises:  Create Date: 2026-05-03 15:25:05.24`, `Config`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 6`** (4 nodes): `42e0b4fc5555_initial.py`, `downgrade()`, `initial  Revision ID: 42e0b4fc5555 Revises:  Create Date: 2026-05-03 15:25:05.24`, `upgrade()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `login()` connect `Community 3` to `Community 4`?**
  _High betweenness centrality (0.330) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 2` to `Community 4`?**
  _High betweenness centrality (0.247) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `UserOut` (e.g. with `MemberOut` and `ProjectCreate`) actually correct?**
  _`UserOut` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `Base` (e.g. with `Project` and `Task`) actually correct?**
  _`Base` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Run migrations in 'offline' mode.      This configures the context with just a U`, `Run migrations in 'online' mode.      In this scenario we need to create an Engi`, `initial  Revision ID: 42e0b4fc5555 Revises:  Create Date: 2026-05-03 15:25:05.24` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._