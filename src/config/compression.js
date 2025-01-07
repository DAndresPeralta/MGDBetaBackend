import ec from 'express-compression';

const compression = ec({
    brotli: { enabled: true, zlib: {} },
  });
  
  export default compression;