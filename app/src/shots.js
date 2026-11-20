// Fixed scenes for screenshots: ?shot=cover shows the cover alone, ?shot=editor
// shows the app with a photo loaded, ?shot=portrait a 1080x1350 cover, and
// ?shot=neon the same cover in the neon grade. window.__shotReady is set once
// the scene is painted, so a screenshot tool knows when to shoot.
export async function runShot(shot, query, api) {
  const caption = query.get('caption') ?? 'Sunset Heist';
  const grade = query.get('grade') ?? 'sunset';
  const hero = await api.loadImage('samples/hero.jpg');
  const street = await api.loadImage('samples/street.jpg');
  api.setCaption(caption);
  api.setGrade(grade);
  api.setDefaultScene(street);
  await api.setHeroPhoto(hero);

  if (shot === 'cover' || shot === 'portrait' || shot === 'neon' || shot === 'wide') {
    document.body.classList.add('shot-cover');
    const canvas = document.getElementById('cover');
    if (shot === 'portrait') {
      canvas.width = 1080;
      canvas.height = 1350;
    }
    if (shot === 'wide' || shot === 'neon') {
      canvas.width = 1920;
      canvas.height = 1080;
    }
    api.redraw();
  }
  // editor: the page as-is, hero loaded, panels filled.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}
