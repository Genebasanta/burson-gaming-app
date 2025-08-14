import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import * as Tone from 'tone';

// SVG inline para los iconos
const LifeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="lucide lucide-heart">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
);

const CharacterSelection = ({ onCharacterSelect }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-yellow-400 mb-8">Burson Gaming</h1>
            <p className="text-xl mb-6">Elige tu personaje</p>
            <div className="flex flex-col sm:flex-row gap-6">
                <button
                    onClick={() => onCharacterSelect('male')}
                    className="flex flex-col items-center p-6 bg-gray-800 hover:bg-gray-700 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                    <span className="text-6xl mb-4">🧑</span>
                    <span className="text-xl font-bold text-white">Bursonlino</span>
                </button>
                <button
                    onClick={() => onCharacterSelect('female')}
                    className="flex flex-col items-center p-6 bg-gray-800 hover:bg-gray-700 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                    <span className="text-6xl mb-4">👩</span>
                    <span className="text-xl font-bold text-white">Bursonlina</span>
                </button>
            </div>
        </div>
    );
};

const GameOverScreen = ({ onRestart, message }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black bg-opacity-75 text-white absolute inset-0 z-50">
            <h2 className="text-4xl font-bold text-red-500 mb-4">{message}</h2>
            <button
                onClick={onRestart}
                className="bg-yellow-400 text-black font-bold py-3 px-6 rounded-lg text-lg hover:bg-yellow-500 transition-colors"
            >
                Reiniciar
            </button>
        </div>
    );
};

// Preguntas y respuestas actualizadas
const questions = [
    { letter: 'B', question: "¿Qué plataformas dominan el streaming de videojuegos a nivel global?", options: ["Twitch, YouTube Gaming y Kick.", "Facebook, Instagram y TikTok.", "Netflix, HBO Max y Disney+."], correctAnswer: "Twitch, YouTube Gaming y Kick." },
    { letter: 'U', question: "¿Qué juego móvil lidera descargas y audiencia en Colombia y LATAM?", options: ["Candy Crush", "Free Fire.", "Clash Royale."], correctAnswer: "Free Fire." },
    { letter: 'R', question: "¿Qué elemento ha transformado más la comunicación en el gaming?", options: ["La publicidad en los juegos.", "La interacción en tiempo real entre streamer y audiencia.", "Los gráficos en 4K."], correctAnswer: "La interacción en tiempo real entre streamer y audiencia." },
    { letter: 'S', question: "Menciona dos videojuegos de PC más jugados globalmente en 2025.", options: ["Call of Duty: Warzone y Fortnite.", "Minecraft y Roblox.", "Counter-Strike 2 y League of Legends."], correctAnswer: "Counter-Strike 2 y League of Legends." },
    { letter: 'O', question: "¿Qué tipo de publicidad es más efectiva en streaming y eSports?", options: ["Anuncios de TV", "Integraciones nativas en vivo y patrocinios de eventos/ligas.", "Anuncios en periódicos."], correctAnswer: "Integraciones nativas en vivo y patrocinios de eventos/ligas." },
    { letter: 'N', question: "¿Qué red o plataforma es clave para engagement y comunidad en gaming?", options: ["LinkedIn", "Twitter", "Discord."], correctAnswer: "Discord." }
];

const Game = ({ onWin, onRestart }) => {
    const [gameState, setGameState] = useState({
        lives: 3,
        collectedLetters: {},
        currentQuestion: null,
        message: null,
    });
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    const [correctSynth, setCorrectSynth] = useState(null);
    const [winSynth, setWinSynth] = useState(null);

    // Initialise Tone.js synths
    useEffect(() => {
        try {
            const newCorrectSynth = new Tone.Synth({
                oscillator: { type: 'sine' },
                envelope: { attack: 0.05, decay: 0.2, sustain: 0.1, release: 0.5 }
            }).toDestination();
            const newWinSynth = new Tone.PolySynth(Tone.Synth).toDestination();

            setCorrectSynth(newCorrectSynth);
            setWinSynth(newWinSynth);
        } catch (e) {
            console.error("Failed to initialize Tone.js", e);
        }
    }, []);

    // Cargar estado guardado
    const loadGame = () => {
        const savedState = localStorage.getItem('bursonGamingState');
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            setGameState(parsedState.gameState);
            alert("Partida cargada exitosamente.");
        } else {
            alert("No hay partida guardada.");
        }
    };
    
    // Guardar estado
    const saveGame = () => {
        const stateToSave = { gameState };
        localStorage.setItem('bursonGamingState', JSON.stringify(stateToSave));
        alert("Partida guardada exitosamente.");
    };

    const handleLetterClick = (letter) => {
        const question = questions.find(q => q.letter === letter);
        if (question && !gameState.collectedLetters[letter]) {
            setGameState(prev => ({ ...prev, currentQuestion: question }));
            setShowQuestionModal(true);
        }
    };

    const handleAnswer = (option) => {
        const { currentQuestion, collectedLetters } = gameState;
        if (option === currentQuestion.correctAnswer) {
            alert("¡Respuesta correcta! Has ganado la letra " + currentQuestion.letter + ".");
            if (correctSynth) correctSynth.triggerAttackRelease("C5", "8n");
            const newLetters = { ...collectedLetters, [currentQuestion.letter]: true };
            
            const allLettersCollected = questions.every(q => newLetters[q.letter]);
            if (allLettersCollected) {
                if (winSynth) winSynth.triggerAttackRelease(["C5", "E5", "G5"], "4n");
                onWin();
            }

            setGameState(prev => ({
                ...prev,
                collectedLetters: newLetters,
                currentQuestion: null,
            }));
            setShowQuestionModal(false);
        } else {
            alert("Respuesta incorrecta. Pierdes una vida.");
            setGameState(prev => {
                const newLives = prev.lives - 1;
                if (newLives <= 0) {
                    setGameOver(true);
                    return {...prev, lives: newLives, message: "¡Perdiste todas tus vidas!"};
                }
                return { ...prev, lives: newLives };
            });
            setShowQuestionModal(false);
        }
    };
    
    const resetGame = () => {
        setGameState({
            lives: 3,
            collectedLetters: {},
            currentQuestion: null,
            message: null,
        });
        setGameOver(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
            <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-4">Burson Gaming</h1>
            <div className="flex items-center justify-between w-full max-w-2xl px-4 mb-4">
                <div className="flex gap-2">
                    {[...Array(gameState.lives)].map((_, i) => (
                        <LifeIcon key={i} className="text-red-500" />
                    ))}
                </div>
                <div className="flex gap-2 text-xl font-bold">
                    {questions.map((q) => (
                        <span key={q.letter} className={gameState.collectedLetters[q.letter] ? 'text-yellow-400' : 'text-gray-600'}>
                            {q.letter}
                        </span>
                    ))}
                </div>
            </div>
            
            <div className="flex items-center justify-center w-full max-w-2xl bg-gray-900 rounded-lg shadow-xl p-8 space-x-4">
                {questions.map((q) => (
                    <button 
                        key={q.letter}
                        onClick={() => handleLetterClick(q.letter)}
                        disabled={gameState.collectedLetters[q.letter]}
                        className={`
                            flex items-center justify-center w-16 h-16 text-3xl font-bold rounded-full 
                            transition-colors duration-300 ease-in-out
                            ${gameState.collectedLetters[q.letter] ? 
                                'bg-yellow-400 text-black cursor-not-allowed' : 
                                'bg-gray-700 text-white hover:bg-gray-600'
                            }
                        `}
                    >
                        {q.letter}
                    </button>
                ))}
            </div>
            
            <div className="flex gap-4 mt-8">
                <button onClick={saveGame} className="bg-white text-black font-bold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                    Guardar
                </button>
                <button onClick={loadGame} className="bg-white text-black font-bold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                    Cargar
                </button>
                <button onClick={resetGame} className="bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors">
                    Reiniciar
                </button>
                <button onClick={onRestart} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                    Finalizar
                </button>
            </div>
            
            {showQuestionModal && gameState.currentQuestion && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
                    <div className="bg-gray-800 p-8 rounded-lg max-w-lg w-full text-center shadow-2xl">
                        <h3 className="text-2xl font-bold text-yellow-400 mb-4">{gameState.currentQuestion.question}</h3>
                        <div className="flex flex-col gap-4">
                            {gameState.currentQuestion.options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswer(option)}
                                    className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {gameOver && <GameOverScreen onRestart={onRestart} message={gameState.message} />}
        </div>
    );
};

const App = () => {
    const [character, setCharacter] = useState(null);
    const [gameStage, setGameStage] = useState('start'); // 'start', 'playing', 'win'

    const handleCharacterSelect = (char) => {
        setCharacter(char);
        setGameStage('playing');
    };
    
    const handleWin = () => {
        setGameStage('win');
    };
    
    const handleRestart = () => {
        setCharacter(null);
        setGameStage('start');
    };

    switch (gameStage) {
        case 'start':
            return <CharacterSelection onCharacterSelect={handleCharacterSelect} />;
        case 'playing':
            return <Game onWin={handleWin} onRestart={handleRestart} />;
        case 'win':
            return <GameOverScreen onRestart={handleRestart} message="¡Has completado la palabra BURSON y ganado el juego!" />;
        default:
            return <CharacterSelection onCharacterSelect={handleCharacterSelect} />;
    }
};

export default App;
