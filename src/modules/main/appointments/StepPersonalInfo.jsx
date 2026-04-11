import { Field, inputClass } from './Field'

export default function StepPersonalInfo({ form, errors, onChange }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-sans text-sm text-text-light">
        Completa tus datos de contacto
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nombre *" error={errors.name}>
          <input
            type="text"
            value={form.name}
            onChange={e => onChange('name', e.target.value)}
            placeholder="María"
            className={inputClass(errors.name)}
          />
        </Field>
        <Field label="Apellido *" error={errors.last_name}>
          <input
            type="text"
            value={form.last_name}
            onChange={e => onChange('last_name', e.target.value)}
            placeholder="García"
            className={inputClass(errors.last_name)}
          />
        </Field>
      </div>

      <Field label="Teléfono *" error={errors.cellphone}>
        <input
          type="tel"
          value={form.cellphone}
          onChange={e => onChange('cellphone', e.target.value)}
          placeholder="+52 317 890 1234"
          className={inputClass(errors.cellphone)}
        />
      </Field>

      <Field label="Correo electrónico (opcional)" error={errors.email}>
        <input
          type="email"
          value={form.email}
          onChange={e => onChange('email', e.target.value)}
          placeholder="correo@ejemplo.com"
          className={inputClass(errors.email)}
        />
      </Field>
    </div>
  )
}
