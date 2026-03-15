import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin, Phone, Globe, Navigation, Search,
  Loader, AlertCircle, Filter, ArrowLeft, ExternalLink
} from 'lucide-react'
import { getHospitals } from '../api'

const DEFAULT_LOCATION = { lat: 12.9277, lon: 79.3714, name: 'Ranipet, Tamil Nadu' }

function HospitalCard({ hospital, index }) {
  const badgeColor = hospital.type === 'hospital'
    ? 'bg-blue-100 text-blue-700'
    : 'bg-emerald-100 text-emerald-700'

  return (
    <div className="card hover:shadow-md transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${badgeColor}`}>
              {hospital.type}
            </span>
            {hospital.emergency === 'yes' && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                Emergency
              </span>
            )}
          </div>
          <h3 className="font-semibold text-slate-800 text-base leading-tight truncate">
            {hospital.name}
          </h3>
          {hospital.address && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">{hospital.address}</p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-teal-700">{hospital.distance_km} km</p>
          <p className="text-xs text-slate-400">away</p>
        </div>
      </div>

      {/* Specialties */}
      {hospital.specialties && hospital.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {hospital.specialties.slice(0, 3).map((spec) => (
            <span key={spec} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
              {spec}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {hospital.phone && (
          <a
            href={`tel:${hospital.phone}`}
            className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 text-xs font-medium px-3 py-2 rounded-lg transition-all"
          >
            <Phone size={13} />
            Call
          </a>
        )}
        <a
          href={hospital.directions_link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium px-3 py-2 rounded-lg transition-all"
        >
          <Navigation size={13} />
          Directions
        </a>
        <a
          href={hospital.maps_link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium px-3 py-2 rounded-lg transition-all"
          title="View on OpenStreetMap"
        >
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  )
}

export default function NearbyHospitals({ analysis }) {
  const navigate = useNavigate()
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [location, setLocation] = useState(null)
  const [locationName, setLocationName] = useState('')
  const [filter, setFilter] = useState('all')
  const [radius, setRadius] = useState(5000)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchHospitals = useCallback(async (lat, lon) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getHospitals(lat, lon, radius)
      setHospitals(data.hospitals || [])
    } catch (err) {
      setError('Unable to fetch hospitals. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }, [radius])

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      // Use default location (Ranipet)
      setLocation(DEFAULT_LOCATION)
      setLocationName(DEFAULT_LOCATION.name)
      fetchHospitals(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon)
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        setLocation({ lat, lon })
        // Reverse geocode using Nominatim
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
          const data = await res.json()
          setLocationName(data.display_name?.split(',').slice(0, 2).join(',') || 'Your location')
        } catch {
          setLocationName('Your current location')
        }
        fetchHospitals(lat, lon)
      },
      () => {
        // Fallback to default
        setLocation(DEFAULT_LOCATION)
        setLocationName(DEFAULT_LOCATION.name + ' (default)')
        fetchHospitals(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon)
      },
      { timeout: 10000 }
    )
  }, [fetchHospitals])

  useEffect(() => {
    getLocation()
  }, [])

  const filteredHospitals = hospitals
    .filter((h) => {
      if (filter === 'hospital') return h.type === 'hospital'
      if (filter === 'clinic') return h.type !== 'hospital'
      if (filter === 'emergency') return h.emergency === 'yes'
      return true
    })
    .filter((h) =>
      searchQuery === '' ||
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address?.toLowerCase().includes(searchQuery.toLowerCase())
    )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">Nearby Hospitals</h1>
          {locationName && (
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <MapPin size={13} />
              {locationName}
            </div>
          )}
        </div>
      </div>

      {/* Specialist recommendation banner */}
      {analysis?.specialist && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 mb-6">
          <p className="text-sm text-teal-800">
            <span className="font-semibold">💡 Based on your symptoms</span>, the AI recommends seeing a{' '}
            <strong>{analysis.specialist}</strong>. Look for hospitals with this specialty below.
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hospitals..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'hospital', label: 'Hospitals' },
              { key: 'clinic', label: 'Clinics' },
              { key: 'emergency', label: 'Emergency' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === key ? 'bg-white shadow-sm text-teal-700' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Radius */}
        <select
          value={radius}
          onChange={(e) => {
            setRadius(Number(e.target.value))
            if (location) fetchHospitals(location.lat, location.lon)
          }}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400"
        >
          <option value={2000}>2 km radius</option>
          <option value={5000}>5 km radius</option>
          <option value={10000}>10 km radius</option>
          <option value={20000}>20 km radius</option>
        </select>
      </div>

      {/* OpenStreetMap embed */}
      {location && (
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm mb-6">
          <iframe
            title="Nearby Hospitals Map"
            width="100%"
            height="320"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lon - 0.05},${location.lat - 0.05},${location.lon + 0.05},${location.lat + 0.05}&layer=mapnik&marker=${location.lat},${location.lon}`}
            style={{ border: 'none' }}
          />
          <div className="bg-slate-50 px-4 py-2 flex items-center justify-between">
            <p className="text-xs text-slate-500">Map data © OpenStreetMap contributors</p>
            <a
              href={`https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lon}#map=14/${location.lat}/${location.lon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-teal-600 hover:underline flex items-center gap-1"
            >
              Open full map <ExternalLink size={11} />
            </a>
          </div>
        </div>
      )}

      {/* Results */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader size={32} className="animate-spin mb-3 text-teal-500" />
          <p>Searching for nearby hospitals...</p>
          <p className="text-xs mt-1">Using live OpenStreetMap data</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 mb-4">
          <AlertCircle size={20} />
          <div>
            <p className="font-medium">{error}</p>
            <button onClick={getLocation} className="text-sm underline mt-1">Try again</button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <p className="text-sm text-slate-500 mb-4">
            Found <strong className="text-slate-800">{filteredHospitals.length}</strong> healthcare facilities
          </p>
          {filteredHospitals.length === 0 ? (
            <div className="card text-center py-12">
              <MapPin size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No hospitals found in this area.</p>
              <p className="text-sm text-slate-400 mt-1">Try increasing the search radius.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredHospitals.map((hospital, i) => (
                <HospitalCard key={hospital.id || i} hospital={hospital} index={i} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Emergency call banner */}
      <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-red-800 text-sm">Medical Emergency?</p>
          <p className="text-xs text-red-600 mt-0.5">Call Tamil Nadu Emergency Helpline immediately</p>
        </div>
        <a
          href="tel:108"
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2"
        >
          <Phone size={16} />
          108
        </a>
      </div>
    </div>
  )
}
