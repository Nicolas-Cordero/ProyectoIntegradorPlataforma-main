import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryAdapter } from './cloudinary.adapter';
import { Readable } from 'stream';
import { StorageService } from '../storage.service';

const FileType = {
  FOTO: 'image/jpeg',
  PDF: 'application/pdf',
};

const makeFile = (mimeType: string, originalName: string) => ({
  fieldname: 'archivo',
  originalname: originalName,
  encoding: '7bit',
  mimetype: mimeType,
  buffer: Buffer.from('fake-content'),
  size: 1024,
  stream: Readable.from(Buffer.from('fake-content')),
  destination: '',
  filename: '',
  path: '',
});

//Estructura de un test unitario típico en Jest
it('...', async () => {
  // Arrange — datos de entrada y configuración de mocks
  // Act     — llamada al servicio real
  // Assert  — verificación del resultado
});

describe('CloudinaryAdapter', () => {
  let adapter: CloudinaryAdapter;
  let mockCloudinary: any;

  beforeEach(async () => {
    // El provider real (CloudinaryProvider) agrega `folders` sobre la instancia
    // de cloudinary; el adapter lo usa para prefijar la carpeta destino, así que
    // el mock debe incluirlo o uploadImage/uploadPDF fallan al leer folders.*.
    mockCloudinary = {
      folders: {
        images: 'imagenes',
        files: 'archivos',
      },
      uploader: {
        upload_stream: jest.fn(),
        destroy: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: StorageService, useClass: CloudinaryAdapter },
        { provide: 'CLOUDINARY', useValue: mockCloudinary },
      ],
    }).compile();

    adapter = module.get<CloudinaryAdapter>(StorageService);
  });

  afterEach(() => {
    // resetAllMocks (y no clearAllMocks) para que los mockResolvedValue de un
    // test no se filtren al siguiente: los métodos no mockeados deben devolver
    // undefined y el servicio omite esa verificación.
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  it('debe subir una imagen y retornar url y publicId', async () => {
    // Arrange
    const file = makeFile(FileType.FOTO, 'foto.jpg');

    mockCloudinary.uploader.upload_stream.mockImplementation(
      (options: any, callback: any) => {
        callback(null, {
          secure_url: 'https://res.cloudinary.com/foto.jpg',
          public_id: 'usuarios/abc123',
        });
        return { end: jest.fn() }; // simula el stream
      },
    );

    // Act
    const resultado = await adapter.uploadImage(file, 'usuarios');

    // Assert
    expect(resultado).toEqual({
      url: 'https://res.cloudinary.com/foto.jpg',
      publicId: 'usuarios/abc123',
    });

    // La carpeta destino se prefija con folders.images.
    expect(mockCloudinary.uploader.upload_stream).toHaveBeenCalledWith(
      expect.objectContaining({
        resource_type: 'image',
        folder: 'imagenes/usuarios',
      }),
      expect.any(Function),
    );
  });

  it('debe eliminar un archivo y retornar void', async () => {
    // Arrange
    mockCloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });

    // Act
    const resultado = await adapter.delete('usuarios/abc123');

    // Assert
    expect(resultado).toBeUndefined();
    expect(mockCloudinary.uploader.destroy).toHaveBeenCalledWith(
      'usuarios/abc123',
    );
  });

  it('debe lanzar error si cloudinary falla', async () => {
    // Arrange
    const file = makeFile(FileType.FOTO, 'foto.jpg');
    mockCloudinary.uploader.upload_stream.mockImplementation(
      (options: any, callback: any) => {
        callback(new Error('Cloudinary caído'), null);
        return { end: jest.fn() };
      },
    );

    // Act & Assert
    await expect(adapter.uploadImage(file, 'usuarios')).rejects.toThrow(
      'Cloudinary caído',
    );
  });

  it('Debe subir un pdf y retornar la url del pdf y su publicId', async () => {
    // Arrange
    const file = makeFile(FileType.PDF, 'notas.pdf');

    mockCloudinary.uploader.upload_stream.mockImplementation(
      (options: any, callback: any) => {
        callback(null, {
          secure_url: 'https://res.cloudinary.com/notas.pdf',
          public_id: 'usuarios/calculo.pdf',
        });
        return { end: jest.fn() }; // simula el stream
      },
    );

    const resultado = await adapter.uploadPDF(file, 'notas');

    expect(resultado).toEqual({
      url: 'https://res.cloudinary.com/notas.pdf',
      publicId: 'usuarios/calculo.pdf',
    });

    // La carpeta destino se prefija con folders.files y el public_id termina
    // en .pdf (móvil necesita la extensión para abrir el archivo).
    expect(mockCloudinary.uploader.upload_stream).toHaveBeenCalledWith(
      expect.objectContaining({
        resource_type: 'raw',
        folder: 'archivos/notas',
        public_id: expect.stringMatching(/\.pdf$/),
      }),
      expect.any(Function),
    );
  });
});
