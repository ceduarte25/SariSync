# SariSync

SariSync is an AI-powered mobile inventory and sales app built with React Native and Expo. It is designed for Android and iOS, and can be opened with Expo Go during development.

The app helps you:

- Add inventory items manually in batch form.
- Add worker or customer names manually in batch form.
- Record sales as either debt or paid cash.
- Track which items sell the most and which customers buy the most.
- Export and import data for backup and reporting.
- Support AI-powered analytics workflows for sales and customer purchase patterns.

## Tech Stack

- React Native
- Expo
- Expo Router
- TypeScript
- Zustand for state management

## Requirements

- Node.js 18 or newer
- npm, pnpm, or yarn
- Expo Go installed on your Android or iPhone if you want to run it on a physical device

## Install

```bash
npm install
```

If you use a different package manager, install with the equivalent command for that tool.

## Run the App

Start the Expo dev server:

```bash
npm run start
```

Then choose one of these options:

- Press `a` to open Android.
- Press `i` to open iOS.
- Scan the QR code with Expo Go on a physical device.

You can also use the platform shortcuts directly:

```bash
npm run android
npm run ios
```

## Useful Scripts

```bash
npm run start      # Start Expo
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run the web preview
npm run lint       # Lint the project
npm run typecheck  # TypeScript check
```

## Features

### Inventory

- Add items one per line.
- Enter a bought price and selling price when available.
- Search and browse the item catalog.

### Workers and Customers

- Add workers or customers one per line.
- Track balances and unpaid sales per person.
- View each person’s sales history and debt status.

### Sales

- Assign items to a worker or customer.
- Record a sale as debt or paid cash.
- Update quantities before saving.

### AI-Powered Reporting and Analytics

- AI-powered reporting highlights top-selling items and customer buying patterns.
- View totals for debt, paid cash, profit, and sales activity.
- Export sales or debt reports as XLSX files.
- Import and back up app data.

## Project Structure

- `src/app` - Expo Router screens and navigation.
- `src/components` - Reusable UI components.
- `src/domain` - Business logic, types, parsers, and selectors.
- `src/services` - Export, import, and backup helpers.
- `src/store` - Persistent application state.

## Notes

- This project is optimized for mobile use.
- Android builds in this workspace may require JDK 21.
- If a native build is needed, use the Expo commands above instead of editing Android or iOS native folders directly.
