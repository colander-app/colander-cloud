import Ajv from 'ajv'

export const validateSchema =
  <T, S extends Record<any, any> = Record<any, any>>(schema: S) =>
  (input: any): input is T => {
    const ajv = new Ajv()
    const validate = ajv.compile(schema)
    const valid = validate(input)
    if (!valid) {
      console.error('validation errors:', ajv.errorsText(validate.errors))
    }
    return valid
  }
