export class ScreenOrientation {
  async lock(lockType = 'landscape') {
    if (!this.canOrientScreen() || this.currentLock) return;
    try {
      await screen.orientation.lock(lockType);
      this.currentLock = lockType;
    } catch (e) {}
  }
  async unlock() {
    if (!this.canOrientScreen() || !this.currentLock) return;
    await screen.orientation.unlock();
  }
  canOrientScreen() {
    return screen.orientation != null && !!screen.orientation.lock && !!screen.orientation.unlock;
  }
}