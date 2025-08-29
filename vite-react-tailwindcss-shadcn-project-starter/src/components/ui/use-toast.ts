import { toast as sonnerToast } from 'sonner';

type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

type ToastActionElement = React.ReactElement<any>;

type Toast = {
  id: string;
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: 'default' | 'destructive';
};

const toast = (props: ToastProps) => {
  const { title, description, variant = 'default' } = props;
  
  if (variant === 'destructive') {
    return sonnerToast.error(title || description || 'An error occurred');
  }
  
  if (title && description) {
    return sonnerToast(title, {
      description,
    });
  }
  
  return sonnerToast.success(title || description || 'Success');
};

// Additional toast methods for convenience
toast.success = (message: string) => sonnerToast.success(message);
toast.error = (message: string) => sonnerToast.error(message);
toast.info = (message: string) => sonnerToast.info(message);
toast.warning = (message: string) => sonnerToast.warning(message);

export const useToast = () => {
  return {
    toast,
  };
};

export { toast };
export type { Toast, ToastProps, ToastActionElement };