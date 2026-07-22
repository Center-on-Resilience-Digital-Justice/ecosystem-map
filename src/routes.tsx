import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.tsx'
import NotFound from './pages/NotFound.tsx'

const baseURL = import.meta.env.BASE_URL

export default function AppRoutes() {
    return (
            <Routes>
                <Route path={`${baseURL}`} element={<Home />} />
                <Route path={`${baseURL}*`} element={<NotFound />} />
                <Route path={`${baseURL}home`} element={<Home />} />
            </Routes>
    )
}