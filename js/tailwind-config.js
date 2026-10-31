// Configuración de Tailwind (CDN). Debe cargarse justo después de https://cdn.tailwindcss.com
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        nailong: {
                            yellow: '#FFD93D',
                            light: '#FFE66D',
                            pale: '#FFF3B0',
                            cream: '#FFFDF2',
                            belly: '#FFF9DB',
                            orange: '#FF9F1C',
                            softorange: '#FFBF69',
                            pink: '#FF8FA3',
                            softpink: '#FFB3C1',
                            sky: '#BDE0FE',
                            mint: '#A8DADC',
                            purple: '#9B5DE5'
                        }
                    },
                    fontFamily: {
                        display: ['Fredoka', 'sans-serif'],
                        body: ['Quicksand', 'sans-serif']
                    }
                }
            }
        }
