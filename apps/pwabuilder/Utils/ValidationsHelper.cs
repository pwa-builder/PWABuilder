namespace PWABuilder.Utils
{
    public static class ValidationsHelper
    {
        public static bool ValidateSingleField(string name, object? obj)
        {
            //This code is a workaround since data is sent to the app insights based on the tests that have been executed on the manifest.
            //It is necessary to migrate the entire manifest-validation
            if (obj == null) return false;

            var objectType = obj.GetType();
            var property = objectType.GetProperty(name);
            if (property == null) return false;

            var propertyType = property.PropertyType;
            if (propertyType == typeof(string))
            {
                var propertyValue = property.GetValue(obj, null) as string;
                return !string.IsNullOrEmpty(propertyValue);
            }

            return propertyType.IsArray && propertyType.GetElementType() == typeof(string);
        }

        public static bool ValidateSingleFieldString(string name, object? obj)
        {
            //This code is a workaround since data is sent to the app insights based on the tests that have been executed on the manifest.
            //It is necessary to migrate the entire manifest-validation
            if (obj == null) return false;

            var objectType = obj.GetType();
            var property = objectType.GetProperty(name);
            if (property == null || property.PropertyType != typeof(string)) return false;

            var propertyType = property.PropertyType;
            var propertyValue = property.GetValue(obj, null) as string;
            return !string.IsNullOrEmpty(propertyValue);
        }

        public static bool ValidateSingleFieldBoolean(string name, object? obj)
        {
            //This code is a workaround since data is sent to the app insights based on the tests that have been executed on the manifest.
            //It is necessary to migrate the entire manifest-validation
            if (obj == null) return false;

            var objectType = obj.GetType();
            var property = objectType.GetProperty(name);
            if (property == null) return false;

            var propertyType = property.PropertyType;
            return propertyType == typeof(bool);
        }

        public static bool GetSingleFieldBoolean(string name, object? obj)
        {
            //This code is a workaround since data is sent to the app insights based on the tests that have been executed on the manifest.
            //It is necessary to migrate the entire manifest-validation
            if (obj == null) return false;

            var objectType = obj.GetType();
            var property = objectType.GetProperty(name);
            if (property == null) return false;

            var propertyType = property.PropertyType;
            if (propertyType != typeof(bool)) return false;

            return (bool)property.GetValue(obj, null);

        }
    }
}
