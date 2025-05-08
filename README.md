

# Directory Structure

├── public
│   └── images
│       ├── 3811384.jpg
│       ├── agent.webp
│       ├── email.svg
│       ├── hero.png
│       ├── login.png
│       ├── otp.svg
│       ├── registration.png
│       ├── verify-email.jpg
│   ├── vite.svg
└── src
    ├── assets
    │   ├── about.jpg
    │   ├── feature.jpg
    │   ├── hero.png
    │   ├── heroo.png
    │   ├── react.svg
    ├── components
    │   ├── common
    │   │   ├── Button.tsx
    │   │   ├── Input.tsx
    │   │   ├── action-tooltip.tsx
    │   │   ├── feature-card.tsx
    │   │   ├── file-upload.tsx
    │   │   ├── loading.tsx
    │   │   ├── market-place-card.tsx
    │   ├── layout
    │   │   ├── Logo.tsx
    │   │   ├── header.tsx
    │   ├── modals
    │   │   ├── CancelOrderModal.tsx
    │   │   ├── ConfrmationModal.tsx
    │   │   ├── SignUpPromptModal.tsx
    │   └── ui
    │       ├── accordion.tsx
    │       ├── alert.tsx
    │       ├── avatar.tsx
    │       ├── badge.tsx
    │       ├── button.tsx
    │       ├── calendar.tsx
    │       ├── card.tsx
    │       ├── checkbox.tsx
    │       ├── command.tsx
    │       ├── dialog.tsx
    │       ├── dropdown-menu.tsx
    │       ├── form.tsx
    │       ├── input-otp.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       ├── navigation-menu.tsx
    │       ├── pagination.tsx
    │       ├── popover.tsx
    │       ├── progress.tsx
    │       ├── radio-group.tsx
    │       ├── scroll-area.tsx
    │       ├── select.tsx
    │       ├── separator.tsx
    │       ├── sheet.tsx
    │       ├── skeleton.tsx
    │       ├── sonner.tsx
    │       ├── stepper.tsx
    │       ├── table.tsx
    │       ├── tabs.tsx
    │       ├── textarea.tsx
    │       ├── tooltip.tsx
    │   ├── CropFieldManager.tsx
    │   ├── GoogleMaps.tsx
    │   ├── WashingStationMap.tsx
    ├── hooks
    │   ├── useAuth.ts
    │   ├── useListingBid.ts
    │   ├── useMobile.tsx
    │   ├── useNotification.tsx
    │   ├── useOrderStatus.tsx
    │   ├── useSampleRequest.ts
    ├── lib
    │   ├── config.ts
    │   ├── utils.ts
    ├── pages
    │   ├── agent
    │   │   ├── farmer-management.tsx
    │   ├── auth
    │   │   ├── CreatePassword.tsx
    │   │   ├── Login.tsx
    │   │   ├── OTP.tsx
    │   │   ├── Signup.tsx
    │   │   ├── VerifyEmail.tsx
    │   │   ├── agent-login.tsx
    │   │   ├── farmer-signup-via-agent.tsx
    │   ├── bank
    │   │   ├── BankInformation.tsx
    │   │   ├── edit-bank.tsx
    │   ├── buyers
    │   │   └── settings
    │   │       ├── SettingsPage.tsx
    │   ├── chats
    │   │   ├── ChatsPage.tsx
    │   ├── company
    │   │   ├── company-onboarding.tsx
    │   ├── crops
    │   │   ├── CoffeeListing.tsx
    │   ├── farms
    │   │   └── farm-profile
    │   │       ├── FarmDetails.tsx
    │   │       ├── FarmProfilePage.tsx
    │   │       ├── FarmSidebar.tsx
    │   │   ├── FarmDetails.tsx
    │   │   ├── FarmManagement.tsx
    │   │   ├── FarmProfile.tsx
    │   │   ├── SkeletonForm.tsx
    │   │   ├── add-crop.tsx
    │   │   ├── add-farm.tsx
    │   ├── landing
    │   │   └── sections
    │   │       ├── about.tsx
    │   │       ├── contact.tsx
    │   │       ├── eudr.tsx
    │   │       ├── features.tsx
    │   │       ├── market-place.tsx
    │   │       ├── testimonial.tsx
    │   │   ├── Hero.tsx
    │   │   ├── contact-us.tsx
    │   │   ├── footer.tsx
    │   │   ├── header.tsx
    │   │   ├── index.tsx
    │   ├── marketplace
    │   │   ├── coffee-listing
    │   │   │   ├── Bid-modal.tsx
    │   │   │   ├── CoffeeListingPage.tsx
    │   │   │   ├── coffee-details-tab.tsx
    │   │   │   ├── coffee-details.tsx
    │   │   │   ├── cup-profile.tsx
    │   │   │   ├── farm-information.tsx
    │   │   │   ├── header.tsx
    │   │   │   ├── order-modal.tsx
    │   │   │   ├── order-sidebar.tsx
    │   │   │   ├── order-status-card.tsx
    │   │   │   ├── photo-gallery.tsx
    │   │   │   ├── review-modal.tsx
    │   │   ├── coffee-listing-seller
    │   │   │   ├── coffee-listing-seller.tsx
    │   │   │   ├── message-thread-list.tsx
    │   │   │   ├── message-thread.tsx
    │   │   │   ├── stat-card.tsx
    │   │   └── my-orders
    │   │       ├── empty-state.tsx
    │   │       ├── favorite-item.tsx
    │   │       ├── filter.tsx
    │   │       ├── loading-skeleton.tsx
    │   │       ├── order-item.tsx
    │   │       ├── render-order-progress.tsx
    │   │       ├── sample-request-item.tsx
    │   │   ├── ListingCard.tsx
    │   │   ├── coffee-image.tsx
    │   │   ├── coffee-marketplace.tsx
    │   │   ├── marketplace-skeleton.tsx
    │   │   ├── my-orders.tsx
    │   │   ├── review-modal.tsx
    │   │   ├── sample-request-modal.tsx
    │   │   ├── skeletons.tsx
    │   │   ├── view-listing-modal.tsx
    │   ├── onboarding
    │   │   └── farm-detail
    │   │       ├── step-four.tsx
    │   │       ├── step-one.tsx
    │   │       ├── step-three.tsx
    │   │       ├── step-two.tsx
    │   │   ├── Welcome.tsx
    │   ├── profile
    │   │   ├── ProfilePhoto.tsx
    │   │   ├── UserProfile.tsx
    │   │   ├── edit-profile.tsx
    │   └── seller
    │       ├── Dashboard.tsx
    │       ├── SellerProfilePage.tsx
    │       ├── orders.tsx
    │       ├── skeletons.tsx
    ├── services
    │   ├── apiService.ts
    │   ├── chatService.ts
    └── types
        └── validation
            ├── auth.ts
            ├── buyer.ts
            ├── seller-onboarding.ts
        ├── api.ts
        ├── coffee-listing.ts
        ├── coffee.ts
        ├── constants.ts
        ├── order.ts
        ├── orders.ts
        ├── types.ts
        ├── user.ts
    ├── App.css
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    ├── vite-env.d.ts
├── .env
├── .gitignore
├── Makefile
├── README.md
├── components.json
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts

# End Directory Structure