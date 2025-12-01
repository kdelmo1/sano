# sano: slugs always nourish oneanother.

A React Native application that aims to provide UCSC students a centralized discussion board platform where students can coordinate dining hall/market swipes and post and save unwanted foods from other students to help reduce the number of Slug Points and food from going to waste.

## Prerequisites.
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app (available on iOS and Android)
- (Optional) Xcode (macOS only) or Android Studio

## Getting started.
1. Clone the repository.
```
git clone https://github.com/kdelmo1/sano.git
cd sano
```

2. Install dependencies.
```
npm install
```

## Running the app.
To start the development server, run
```
npm start
```
This will open the Expo DevTools in your browser or give an output in the terminal. From there, you have four options:
1. (Recommended) Run on physical device.
    1. Install the Expo Go app on your mobile device.
    2. Scan the QR code displayed in the terminal or Expo DevToools.
    3. The app will load on your device through the ExpoGo app.
  
2. Run on iOS Simulator (ensure you have Xcode installed on a device running macOS).

    ```
    npm run ios
    ```

4. Run on Android Simulator (ensure yo have an Android emulator running before executing the command).
    ```
    npm run android
    ```
5. Run on web.
    ```
    npm run web
    ```

## Project structure.
```
sano/
├── src/       
├──── assets/       # Images and icons.
├──── context/      # React Context providers for global state.
├──── lib/          # Third-party service configurations and clients.
├──── screens/      # Screen components.
├──── styles/       # Shared styles and theme definitions.
├── App.tsx         # Root component.
```

## Tech stack.
- **Framework**: Expo.
- **Language**: TypeScript.
- **Backend**: Supabase.

## Development.
### Linting
Check for linting errors using:
```
npm run lint
```

Auto-fix linting issues using:
```
npm run lint:fix
```

### TypeScript
This project uses TypeScript. Make sure to define types for new components and functions.

## Common issues.

### Metro Bundler Issues

If you encounter caching issues, try:

```
expo start -c
```

This clears the Metro bundler cache.

### Dependency Issues

If you're having problems after pulling new changes:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Supabase connection issues.
Verify that `supabase.ts` contains the correct `SUPABASE_URL` and `SUPABASE_ANON_KEY` credentials.

## Contributing.
1. Create a feature branch: `git checkout -b [feature]`.
2. Make your changes and ensure linting passes: `npm run lint`.
3. Commit your changes: `git commit -am 'Add new feature'`.
4. Push to the branch: `git push origin [feature]`.
5. Submit a pull request.

## Useful commands.
- `npm start` - Start the Expo development server.
- `npm run ios` - Run on iOS simulator.
- `npm run android` - Run on Android emulator.
- `npm run web` - Run in web browser.
- `npm run lint` - Check code quality.
- `npm run lint:fix` - Auto-fix linting issues.


## Resources.
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Supabase Documentation](https://supabase.com/docs)
- [React Native Elements](https://reactnativeelements.com/docs)

## Support.
For questions or issues, contact kdelmo@ucsc.edu or message `delmoh` on Discord.
