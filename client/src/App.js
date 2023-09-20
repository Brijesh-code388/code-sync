import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import EditorPage from './pages/EditorPage';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import NotSupport from './pages/NotSupport';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 700,
            md: 900,
            lg: 1200,
            xl: 1536,
        }
    }
});
function App() {
    const [windowSize, setWindowSize] = useState(getWindowSize());
    function getWindowSize() {
        const { innerWidth, innerHeight } = window;
        return { innerWidth, innerHeight };
    }
    useEffect(() => {
        function handleWindowResize() {
            setWindowSize(getWindowSize());
        }

        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);

    return (
        <>
            <ThemeProvider theme={darkTheme}>
                <div>
                    {/* {console.log(windowSize)} */}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            success: {
                                theme: {
                                    primary: '#4aed88',
                                },
                            },
                        }}
                    ></Toaster>
                </div>
                <BrowserRouter>
                    <Routes>
                        <Route
                            path="/"
                            element={<Home />}
                        ></Route>
                        <Route
                            path="/editor/:roomId"
                            element={windowSize.innerWidth >= 690 ? <EditorPage /> : <NotSupport />}
                        ></Route>

                    </Routes>
                </BrowserRouter>
            </ThemeProvider>
        </>
    );
}

export default App;
