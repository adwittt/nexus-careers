import React from 'react'

/**
 * Extracted outside to ensure a stable component identity 
 * across re-renders — prevents input focus loss bug.
 */
const Field = ({ label, name, type = 'text', placeholder, value, onChange, error, right, rightIcon }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder || label}
          className={`input-field ${right ? 'pr-10' : ''} ${error ? 'border-red-400' : ''}`}
        />
        {right && (
          <button type="button" onClick={right}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer p-0">
            {rightIcon}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

export default Field
