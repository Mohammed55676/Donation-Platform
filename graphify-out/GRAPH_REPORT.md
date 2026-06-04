# Graph Report - Donation Platform2  (2026-06-04)

## Corpus Check
- 202 files · ~145,605 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1766 nodes · 3142 edges · 86 communities (76 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4722844c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 76|Community 76]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 222 edges
2. `sendSuccess()` - 74 edges
3. `Button` - 44 edges
4. `useAuth()` - 38 edges
5. `Input()` - 22 edges
6. `Badge()` - 20 edges
7. `Card()` - 19 edges
8. `CardContent()` - 19 edges
9. `useLanguage()` - 19 edges
10. `Label()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `ToasterWrapper()` --calls--> `useLanguage()`  [EXTRACTED]
  src/app/App.tsx → src/app/context/LanguageContext.tsx
- `NotificationBell()` --calls--> `useNotifications()`  [EXTRACTED]
  src/app/components/DashboardLayout.tsx → src/app/context/NotificationContext.tsx
- `Sidebar()` --calls--> `useAuth()`  [EXTRACTED]
  src/app/components/DashboardLayout.tsx → src/app/context/AuthContext.tsx
- `AlertDialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  src/app/components/ui/alert-dialog.tsx → src/app/components/ui/utils.ts
- `AlertTitle()` --calls--> `cn()`  [EXTRACTED]
  src/app/components/ui/alert.tsx → src/app/components/ui/utils.ts

## Import Cycles
- None detected.

## Communities (86 total, 10 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.01
Nodes (191): admin.add_campaign, admin.add_user, admin.campaign_list_desc, admin.manage_campaigns, admin.manage_donations, admin.manage_users, admin.pending_count, admin.stat_deliveries (+183 more)

### Community 1 - "Community 1"
Cohesion: 0.01
Nodes (191): admin.add_campaign, admin.add_user, admin.campaign_list_desc, admin.manage_campaigns, admin.manage_donations, admin.manage_users, admin.pending_count, admin.stat_deliveries (+183 more)

### Community 2 - "Community 2"
Cohesion: 0.03
Nodes (65): dependencies, axios, canvas-confetti, class-variance-authority, clsx, cmdk, date-fns, @emailjs/browser (+57 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (42): BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator(), CardAction(), CardFooter() (+34 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (42): bool, BM25, detect_domain(), _load_csv(), Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query, Load CSV and return list of dicts (+34 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (29): Props, Props, BeneficiaryVerificationModal(), Props, ChatDialogProps, Message, RATING_TAGS, RatingDialogProps (+21 more)

### Community 6 - "Community 6"
Cohesion: 0.05
Nodes (41): 1. Accessibility (CRITICAL), 2. Touch & Interaction (CRITICAL), 3. Performance (HIGH), 4. Layout & Responsive (HIGH), 5. Typography & Color (MEDIUM), 6. Animation (MEDIUM), 7. Style Selection (MEDIUM), 8. Charts & Data (LOW) (+33 more)

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (32): AuthLayout(), Login(), Signup(), BeneficiaryProfileModal(), CreatePostPage(), Details(), Feed(), FilterBar() (+24 more)

### Community 8 - "Community 8"
Cohesion: 0.06
Nodes (36): Separator(), SheetDescription(), SheetHeader(), Sidebar(), SidebarContent(), SidebarContext, SidebarContextProps, SidebarFooter() (+28 more)

### Community 9 - "Community 9"
Cohesion: 0.10
Nodes (27): RatingDialog(), Campaign, useCampaigns(), VolunteerOpportunity, DONATION_STATUS_BADGE, emptyCampaign, emptyOppForm, ManagedUser (+19 more)

### Community 10 - "Community 10"
Cohesion: 0.07
Nodes (33): adminGetDocument(), adminGetProofDocument(), adminListProfiles(), adminUpdateStatus(), { AppError }, BeneficiaryProfile, fs, getMyProfile() (+25 more)

### Community 11 - "Community 11"
Cohesion: 0.09
Nodes (23): CenterType, DeliveryMethod, DonationCenter, DonationType, mockCampaigns, mockCenters, CampaignCards(), CenterCard() (+15 more)

### Community 12 - "Community 12"
Cohesion: 0.06
Nodes (24): ToasterWrapper(), router, AuthProvider(), Language, LanguageContext, LanguageContextType, LanguageProvider(), TranslationKey (+16 more)

### Community 13 - "Community 13"
Cohesion: 0.08
Nodes (26): adminListRequests(), adminReviewRequest(), { AppError }, BeneficiaryProfile, check14DayRestriction(), createRequest(), Donation, DonationRequest (+18 more)

### Community 14 - "Community 14"
Cohesion: 0.06
Nodes (25): mongoose, path, messageSchema, mongoose, express, router, apiRouter, app (+17 more)

### Community 15 - "Community 15"
Cohesion: 0.07
Nodes (27): dependencies, bcrypt, cors, dotenv, express, express-rate-limit, helmet, joi (+19 more)

### Community 16 - "Community 16"
Cohesion: 0.15
Nodes (15): ForgotPassword(), Errors, ResetPassword(), Errors, Contact(), infos, NotFound(), Button (+7 more)

### Community 17 - "Community 17"
Cohesion: 0.11
Nodes (22): acceptConversation(), { AppError }, Block, blockConversation(), CommunityRequest, confirmAgreement(), confirmDelivery(), Conversation (+14 more)

### Community 18 - "Community 18"
Cohesion: 0.07
Nodes (26): dependencies, react, react-dom, remotion, @remotion/cli, @remotion/tailwind-v4, tailwindcss, description (+18 more)

### Community 19 - "Community 19"
Cohesion: 0.11
Nodes (24): { AppError }, crypto, forgotPassword(), getMe(), googleLogin(), jwt, login(), logout() (+16 more)

### Community 20 - "Community 20"
Cohesion: 0.12
Nodes (23): { AppError }, Campaign, createCampaign(), deleteCampaign(), getCampaign(), listCampaigns(), { parsePagination, buildPaginationMeta }, { sendSuccess } (+15 more)

### Community 21 - "Community 21"
Cohesion: 0.20
Nodes (16): CATEGORIES, FilterBarProps, PostFormProps, DonationContext, DonationContextValue, DonationProvider(), ExtendedDonation, UnifiedDonationStatus (+8 more)

### Community 22 - "Community 22"
Cohesion: 0.17
Nodes (17): PostForm(), DashboardLayout(), Navbar(), TESTIMONIALS, useLanguage(), DonationCampaign, CampaignCardsProps, About() (+9 more)

### Community 23 - "Community 23"
Cohesion: 0.11
Nodes (19): adminToggleHide(), { AppError }, Donation, getUserRatings(), Rating, recalcUserRating(), { sendSuccess }, submitRating() (+11 more)

### Community 24 - "Community 24"
Cohesion: 0.08
Nodes (14): campaignSchema, mongoose, communityRequestSchema, mongoose, donationSchema, mongoose, mongoose, volunteerOpportunitySchema (+6 more)

### Community 25 - "Community 25"
Cohesion: 0.12
Nodes (19): { AppError }, createDonation(), deleteDonation(), Donation, getDonation(), { parsePagination, buildPaginationMeta }, { sendSuccess }, updateDonation() (+11 more)

### Community 26 - "Community 26"
Cohesion: 0.10
Nodes (20): Anti-Pattern: Over-Engineering from First Principles, Conventional Thinking, Conventional Thinking, Conventional Thinking, Conventional Thinking, Conventional Thinking, Example 1: Database Selection, Example 2: Microservices vs Monolith (+12 more)

### Community 27 - "Community 27"
Cohesion: 0.10
Nodes (19): 1. Install dependencies, 2. Configure environment, 3. Run in development, 3. Seed Database (Optional but Recommended), 4. Run in production, 📡 API Endpoints, Auth  `/api/auth`, Campaigns  `/api/campaigns` (+11 more)

### Community 28 - "Community 28"
Cohesion: 0.13
Nodes (18): { AppError }, applyForOpportunity(), createOpportunity(), deleteOpportunity(), getMyApplications(), getOpportunity(), { parsePagination, buildPaginationMeta }, { sendSuccess } (+10 more)

### Community 29 - "Community 29"
Cohesion: 0.10
Nodes (19): Additional Resources, Boundaries, Common Patterns, Core Process, Example Files, First Principles Thinking, Integration with Other Thinking Tools, Output Format (+11 more)

### Community 30 - "Community 30"
Cohesion: 0.14
Nodes (17): addComment(), { AppError }, CommunityRequest, createRequest(), deleteRequest(), getRequest(), { parsePagination, buildPaginationMeta }, { sendSuccess } (+9 more)

### Community 31 - "Community 31"
Cohesion: 0.11
Nodes (18): Application Template, Capital Requirements, Caution: When This Approach Fails, Domain Expertise, First Principles Breakdown, First Principles Breakdown, First Principles: Elon Musk Examples, Key Lessons for Software Engineers (+10 more)

### Community 32 - "Community 32"
Cohesion: 0.16
Nodes (11): roleRoutes, Notification, NotificationDropdown(), DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuRadioItem(), DropdownMenuShortcut() (+3 more)

### Community 33 - "Community 33"
Cohesion: 0.11
Nodes (17): 10. How Arabic RTL is Implemented, 11. How Responsiveness is Handled, 12. How to Edit and Maintain the Project Later, 13. Future Improvements (For the Next Developer), 1. What the Project Does, 2. Why it Exists, 3. All Pages and Their Purpose, 4. All Components and What Each One Does (+9 more)

### Community 34 - "Community 34"
Cohesion: 0.15
Nodes (13): DashboardLayoutProps, NotificationBell(), roleTitles, Sidebar(), sidebarByRole, SidebarItem, DropdownMenuLabel(), Sheet() (+5 more)

### Community 35 - "Community 35"
Cohesion: 0.16
Nodes (15): { AppError }, createUser(), deleteUser(), getUser(), { parsePagination, buildPaginationMeta }, { sendSuccess, sendError }, toggleWishlist(), updateUser() (+7 more)

### Community 36 - "Community 36"
Cohesion: 0.12
Nodes (16): 1. Overview & Creative North Star, 2. Colors: Tonal Depth & The No-Line Rule, 3. Typography: Editorial Authority, 4. Elevation & Depth: The Layering Principle, 5. Layout & RTL Standards (CRITICAL), 6. Components, 7. Do's and Don'ts, Buttons (+8 more)

### Community 37 - "Community 37"
Cohesion: 0.12
Nodes (11): Menubar(), MenubarCheckboxItem(), MenubarContent(), MenubarItem(), MenubarLabel(), MenubarRadioItem(), MenubarSeparator(), MenubarShortcut() (+3 more)

### Community 38 - "Community 38"
Cohesion: 0.17
Nodes (11): { AppError }, nodemailer, sendContactMessage(), { sendSuccess }, AppError, errorHandler(), { sendError }, express (+3 more)

### Community 39 - "Community 39"
Cohesion: 0.12
Nodes (9): ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut(), ContextMenuSubContent() (+1 more)

### Community 40 - "Community 40"
Cohesion: 0.13
Nodes (14): Author, Complementary Skills, Contributing, Core Methodology, Example, First Principles Thinking Skill, Installation, License (+6 more)

### Community 41 - "Community 41"
Cohesion: 0.22
Nodes (5): NotificationToastProps, useRealtimeNotifications(), DemoNotifications(), notificationSound, NotificationSoundGenerator

### Community 42 - "Community 42"
Cohesion: 0.18
Nodes (11): Avatar(), Comment(), CommentProps, VolunteerList(), VolunteerListProps, CommunityComment, CommunityState, CommunityUser (+3 more)

### Community 43 - "Community 43"
Cohesion: 0.15
Nodes (10): jwt, protect(), { sendError }, User, mongoose, userSchema, conversationController, express (+2 more)

### Community 44 - "Community 44"
Cohesion: 0.19
Nodes (13): Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext(), CarouselOptions (+5 more)

### Community 45 - "Community 45"
Cohesion: 0.19
Nodes (10): Badge(), BadgeProps, EditPostModal(), IconButton(), IconButtonProps, getUser(), PostCard(), PostCardProps (+2 more)

### Community 46 - "Community 46"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, jsx, lib, module, noEmit, noUnusedLocals (+4 more)

### Community 47 - "Community 47"
Cohesion: 0.23
Nodes (10): FormControl(), FormDescription(), FormFieldContext, FormFieldContextValue, FormItem(), FormItemContext, FormItemContextValue, FormLabel() (+2 more)

### Community 48 - "Community 48"
Cohesion: 0.18
Nodes (10): 1. Problem Essence, 2. Assumptions Challenged, 3. Ground Truths, 4. Reasoning Chain, 5. Conclusion, Context, Example: Microservices Architecture Review, First Principles Analysis: Should We Adopt Microservices? (+2 more)

### Community 49 - "Community 49"
Cohesion: 0.22
Nodes (8): Messages(), Conversation, Message, MessagesCenter(), MOCK_CONVERSATIONS, MOCK_MESSAGES, OnlinePresenceIndicator(), Props

### Community 50 - "Community 50"
Cohesion: 0.18
Nodes (10): name, vite, pnpm, overrides, private, scripts, build, dev (+2 more)

### Community 51 - "Community 51"
Cohesion: 0.22
Nodes (8): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), THEMES, useChart()

### Community 52 - "Community 52"
Cohesion: 0.22
Nodes (9): NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuTrigger(), navigationMenuTriggerStyle (+1 more)

### Community 53 - "Community 53"
Cohesion: 0.22
Nodes (8): AGENTS.md — Donation Platform, Architecture, Auth, Commands, Database models (MongoDB/Mongoose), Gotchas, Repo structure, Style system

### Community 54 - "Community 54"
Cohesion: 0.22
Nodes (7): Pagination(), PaginationContent(), PaginationEllipsis(), PaginationLink(), PaginationLinkProps, PaginationNext(), PaginationPrevious()

### Community 55 - "Community 55"
Cohesion: 0.25
Nodes (8): devDependencies, tailwindcss, @tailwindcss/vite, @types/leaflet, @types/react, @types/react-dom, vite, @vitejs/plugin-react

### Community 56 - "Community 56"
Cohesion: 0.57
Nodes (4): Message, Avatar(), AvatarFallback(), AvatarImage()

### Community 57 - "Community 57"
Cohesion: 0.29
Nodes (5): donationIcon, ICON_OPTIONS, MapLocation, MapViewProps, requestIcon

### Community 58 - "Community 58"
Cohesion: 0.29
Nodes (6): Commands, Docs, Help, Issues, License, Remotion video

### Community 59 - "Community 59"
Cohesion: 0.29
Nodes (6): computedHash, source, sourceType, skills, design-md, version

### Community 60 - "Community 60"
Cohesion: 0.43
Nodes (5): ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 61 - "Community 61"
Cohesion: 0.40
Nodes (5): peerDependenciesMeta, react, react-dom, optional, optional

### Community 63 - "Community 63"
Cohesion: 0.40
Nodes (4): Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger()

### Community 64 - "Community 64"
Cohesion: 0.50
Nodes (4): Alert(), AlertDescription(), AlertTitle(), alertVariants

### Community 66 - "Community 66"
Cohesion: 0.50
Nodes (3): permissions, allow, defaultMode

## Knowledge Gaps
- **978 isolated node(s):** `PreToolUse`, `defaultMode`, `allow`, `bool`, `name` (+973 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 3` to `Community 5`, `Community 8`, `Community 9`, `Community 16`, `Community 21`, `Community 22`, `Community 32`, `Community 34`, `Community 37`, `Community 39`, `Community 44`, `Community 45`, `Community 47`, `Community 51`, `Community 52`, `Community 54`, `Community 56`, `Community 60`, `Community 63`, `Community 64`, `Community 65`, `Community 69`, `Community 70`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `sendSuccess()` connect `Community 17` to `Community 35`, `Community 38`, `Community 10`, `Community 13`, `Community 19`, `Community 20`, `Community 23`, `Community 25`, `Community 28`, `Community 30`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `Button` connect `Community 16` to `Community 32`, `Community 34`, `Community 5`, `Community 7`, `Community 8`, `Community 41`, `Community 9`, `Community 11`, `Community 44`, `Community 45`, `Community 49`, `Community 21`, `Community 22`, `Community 54`, `Community 56`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `PreToolUse`, `defaultMode`, `allow` to the rest of the system?**
  _1004 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.010416666666666666 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.010416666666666666 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.03076923076923077 - nodes in this community are weakly interconnected._