export const successResponse = (message: string, object: any = null) => {
  return { Success: true, Message: message, Object: object, Errors: null };
};

export const errorResponse = (message: string, errors: string[] | null = null) => {
  return { Success: false, Message: message, Object: null, Errors: errors };
};

export const paginatedResponse = (message: string, items: any[], page: number, size: number, total: number) => {
  return {
    Success: true,
    Message: message,
    Object: items,
    PageNumber: page,
    PageSize: size,
    TotalSize: total,
    Errors: null
  };
};