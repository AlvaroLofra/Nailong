import { registerRoot } from 'remotion';
import { Root } from './Root';

// Cargar fuente Fredoka para renderizado tipográfico óptimo
if (typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700;800;900&display=swap';
  document.head.appendChild(link);
}

registerRoot(Root);

